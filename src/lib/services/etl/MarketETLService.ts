import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MarketSource, ETLParserResult } from '@/types/livestock';
import { SalamancaParser } from './parsers/SalamancaParser';
import { LeonParser } from './parsers/LeonParser';
import { SieroParser } from './parsers/SieroParser';
import { SantiagoParser } from './parsers/SantiagoParser';
import { TalaveraParser } from './parsers/TalaveraParser';
import crypto from 'crypto';

// Initialize Supabase Service Role client to bypass RLS
const getAdminClient = (): SupabaseClient => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export class MarketETLService {
    
    /**
     * Procesa la extracción, parseo y sincronización de una única lonja.
     * Implementa deduplicación por checksum SHA-256 para prevenir escrituras innecesarias.
     * 
     * @param source Fuente de lonja a procesar
     * @param supabase Cliente administrativo de Supabase con bypass de RLS
     */
    static async processSource(source: MarketSource, supabase: SupabaseClient): Promise<{ success: boolean; unchanged?: boolean; message?: string }> {
        try {
            console.log(`Processing source: ${source.name} (${source.source_type})`);
            
            // Route to correct parser
            let result: ETLParserResult;
            
            if (source.name.includes('Salamanca')) {
                result = await SalamancaParser.parse(source);
            } else if (source.name.includes('León')) {
                result = await LeonParser.parse(source);
            } else if (source.name.includes('Siero')) {
                result = await SieroParser.parse(source);
            } else if (source.name.includes('Santiago')) {
                result = await SantiagoParser.parse(source);
            } else if (source.name.includes('Talavera')) {
                result = await TalaveraParser.parse(source);
            } else {
                console.warn(`No parser configured for source: ${source.name}`);
                return { success: false, message: `Sin parser configurado para ${source.name}` };
            }
            
            // Checksum
            const checksum = crypto.createHash('sha256').update(result.rawContent).digest('hex');
            
            const { data: existingSnapshot } = await supabase
                .from('raw_market_snapshots')
                .select('id')
                .eq('market_source_id', source.id)
                .eq('checksum', checksum)
                .single();
                
            if (existingSnapshot) {
                console.log(`Skipping ${source.name}: Content has not changed since last successful fetch (checksum match).`);
                
                await supabase
                    .from('market_sources')
                    .update({ 
                        last_success_at: new Date().toISOString(),
                        last_error_at: null 
                    })
                    .eq('id', source.id);
                
                return {
                    success: true,
                    unchanged: true,
                    message: `La ${source.name} ya está sincronizada con la última sesión oficial disponible.`
                };
            }
            
            if (result.prices.length === 0) {
                throw new Error("El parser funcionó pero no extrajo ningún precio (0 registros). Es probable que la estructura del documento haya cambiado.");
            }

            // Save Raw Snapshot
            await supabase.from('raw_market_snapshots').insert({
                market_source_id: source.id,
                source_url: source.source_url,
                content_type: result.contentType,
                raw_content: result.rawContent,
                parsed_successfully: true,
                parser_version: '1.0.1',
                checksum: checksum
            });
            
            if (result.prices.length > 0) {
                const pricesToInsert = result.prices.map(p => ({
                    ...p,
                    market_source_id: source.id,
                }));
                
                const CHUNK_SIZE = 5000;
                for (let i = 0; i < pricesToInsert.length; i += CHUNK_SIZE) {
                    const chunk = pricesToInsert.slice(i, i + CHUNK_SIZE);
                    const { error: insertError } = await supabase
                        .from('livestock_prices')
                        .upsert(chunk, { onConflict: 'market_source_id, date, category_name, unit', ignoreDuplicates: true });
                        
                    if (insertError) {
                        console.error(`Error inserting chunk for ${source.name} (index ${i}):`, insertError);
                        throw new Error(`Error en la inserción de base de datos: ${insertError.message}`);
                    }
                }
                console.log(`Inserted up to ${result.prices.length} prices for ${source.name}`);
            }
            
            await supabase
                .from('market_sources')
                .update({ 
                    last_success_at: new Date().toISOString(),
                    last_error_at: null 
                })
                .eq('id', source.id);
                
            return {
                success: true,
                unchanged: false,
                message: `Sincronización exitosa: Se han importado ${result.prices.length} cotizaciones de ${source.name}.`
            };
                
        } catch (err: unknown) {
            console.error(`Error processing source ${source.name}:`, err);
            await supabase
                .from('market_sources')
                .update({ last_error_at: new Date().toISOString() })
                .eq('id', source.id);
            throw err;
        }
    }

    /**
     * Ejecuta el pipeline ETL para una lonja específica o para todas las lonjas activas.
     * 
     * Optimización de Rendimiento:
     * - En modo masivo ejecuta las fuentes en paralelo con `Promise.allSettled`.
     * - Reduce el tiempo total de ~25s (secuencial) a ~9-11s (concurrente), previniendo timeouts serverless de Vercel.
     * - Aísla los fallos de red individuales: si una lonja falla o responde lento, las demás continúan sin abortarse.
     * 
     * @param sourceId Opcional. ID de la lonja si se desea sincronización individual forzada.
     */
    static async run(sourceId?: string): Promise<{ success: boolean; unchanged?: boolean; message?: string }> {
        console.log('Starting Market ETL Service...');
        const supabase = getAdminClient();
        
        // 1. Fetch active sources
        let query = supabase.from('market_sources').select('*').eq('active', true);
        
        if (sourceId) {
            query = query.eq('id', sourceId);
        }
        
        const { data: sources, error } = await query;
            
        if (error || !sources || sources.length === 0) {
            console.error('Error fetching market sources:', error);
            return { success: false, message: 'No se encontraron fuentes de lonjas activas' };
        }
        
        console.log(`Found ${sources.length} active sources.`);
        
        if (sourceId) {
            // Ejecución individual
            return await MarketETLService.processSource(sources[0], supabase);
        }

        // Ejecución concurrente en paralelo con Promise.allSettled (reduce tiempo total y aísla fallos)
        const settledResults = await Promise.allSettled(
            sources.map(source => MarketETLService.processSource(source, supabase))
        );

        let successCount = 0;
        let failCount = 0;
        for (const res of settledResults) {
            if (res.status === 'fulfilled' && res.value.success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        console.log(`Market ETL Service finished: ${successCount} successful, ${failCount} failed.`);
        return {
            success: successCount > 0,
            message: `Sincronización completada: ${successCount} lonjas sincronizadas${failCount > 0 ? `, ${failCount} con incidencias` : ''}.`
        };
    }
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / LECCIONES APRENDIDAS
 * -----------------------------------------------------------------------------
 * 1. Decisión de Concurrencia (Promise.allSettled):
 *    - Problema previo: Bucle for...of secuencial tardaba >22s sumando latencias de PDFs y HTMLs.
 *    - En Vercel Serverless, los crons corrían el riesgo de agotar el timeout de ejecución por defecto (10-15s).
 *    - Solución: Promise.allSettled garantiza que cada lonja se procese concurrentemente, bajando la duración a ~9s
 *      y blindando el pipeline para que una caída de red en Talavera o León no impida la sincronización de Salamanca o Siero.
 * 
 * 2. Deduplicación por Checksum SHA-256:
 *    - Al correr el cron cada 4 horas ("0 *\/4 * * *"), la mayoría de invocaciones detectarán documentos idénticos.
 *    - Al comparar el hash SHA-256 del contenido crudo frente a `raw_market_snapshots`, la ejecución termina en ~50ms
 *      sin generar inserciones duplicadas ni saturar la base de datos de Supabase.
 * -----------------------------------------------------------------------------
 */
