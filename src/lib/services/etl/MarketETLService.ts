import { createClient } from '@supabase/supabase-js';
import { MarketSource, ETLParserResult } from '@/types/livestock';
import { SalamancaParser } from './parsers/SalamancaParser';
import { LeonParser } from './parsers/LeonParser';
import { SieroParser } from './parsers/SieroParser';
import { SantiagoParser } from './parsers/SantiagoParser';
import { TalaveraParser } from './parsers/TalaveraParser';
import crypto from 'crypto';

// Initialize Supabase Service Role client to bypass RLS
const getAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export class MarketETLService {
    
    static async run(sourceId?: string) {
        console.log('Starting Market ETL Service...');
        const supabase = getAdminClient();
        
        // 1. Fetch active sources
        let query = supabase.from('market_sources').select('*').eq('active', true);
        
        if (sourceId) {
            query = query.eq('id', sourceId);
        }
        
        const { data: sources, error } = await query;
            
        if (error || !sources) {
            console.error('Error fetching market sources:', error);
            return;
        }
        
        console.log(`Found ${sources.length} active sources.`);
        
        for (const source of sources) {
            try {
                console.log(`Processing source: ${source.name} (${source.source_type})`);
                
                // 2. Route to correct parser
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
                    continue;
                }
                
                // 3. Compute Checksum of raw content to prevent duplicate snapshots
                const checksum = crypto.createHash('sha256').update(result.rawContent).digest('hex');
                
                // Check if this snapshot already exists
                const { data: existingSnapshot } = await supabase
                    .from('raw_market_snapshots')
                    .select('id')
                    .eq('market_source_id', source.id)
                    .eq('checksum', checksum)
                    .single();
                    
                if (existingSnapshot) {
                    console.log(`Skipping ${source.name}: Content has not changed since last successful fetch (checksum match).`);
                    
                    // Si se ha pedido forzar (sourceId existe) lanzamos un error amigable para que la UI no marque un falso éxito nuevo.
                    if (sourceId) {
                        throw new Error("El archivo original en la web no ha cambiado. No hay precios nuevos que importar.");
                    }
                    
                    continue;
                }
                
                // 4. Validate before saving
                if (result.prices.length === 0) {
                    throw new Error("El parser funcionó pero no extrajo ningún precio (0 registros). Es probable que la estructura del documento haya cambiado.");
                }

                // 5. Save Raw Snapshot
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
                
                // Update success timestamp
                await supabase
                    .from('market_sources')
                    .update({ last_success_at: new Date().toISOString() })
                    .eq('id', source.id);
                    
            } catch (err: any) {
                console.error(`Error processing source ${source.name}:`, err);
                // Update error timestamp
                await supabase
                    .from('market_sources')
                    .update({ last_error_at: new Date().toISOString() })
                    .eq('id', source.id);
                    
                // Si el usuario forzó esta importación de manera individual, queremos que la API capture el error para notificarlo.
                if (sourceId) {
                    throw err;
                }
            }
        }
        
        console.log('Market ETL Service finished.');
    }
}
