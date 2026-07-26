import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '', 
});

/**
 * Función para traducir textos usando la API de Claude (Anthropic).
 */
async function translateText(text: string, targetLang = 'Portugués') {
    if (!text || !process.env.ANTHROPIC_API_KEY) return null;
    
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022", // Último modelo de Haiku
            max_tokens: 1024,
            temperature: 0.1,
            system: `Eres un traductor experto y profesional. Tu única tarea es traducir el texto proporcionado al ${targetLang}. Devuelve ÚNICAMENTE la traducción, sin explicaciones, sin comillas, ni texto adicional. Mantén el tono original.`,
            messages: [
                {
                    "role": "user",
                    "content": text
                }
            ]
        });
        
        // @ts-ignore
        return msg.content[0]?.text?.trim() || null;
    } catch (e: any) {
        console.error("Error en la traducción con Claude:", e.status, e.error || e);
        return null;
    }
}

export async function GET(request: Request) {
    // 1. Verificación de Seguridad: Asegurar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 2. Obtener anuncios activos sin traducir
        // Limitar a 20 por ejecución para no exceder los límites de Vercel Serverless
        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, title, description')
            .eq('status', 'active')
            .is('title_pt', null)
            .limit(20);

        if (error) {
            console.error("Error al buscar anuncios:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!listings || listings.length === 0) {
            return NextResponse.json({ message: "No hay anuncios pendientes de traducción." });
        }

        let count = 0;

        // 3. Procesar y traducir cada anuncio
        for (const listing of listings) {
            try {
                const title_pt = await translateText(listing.title);
                const description_pt = await translateText(listing.description);

                if (title_pt) {
                    const { error: updateError } = await supabaseAdmin
                        .from('listings')
                        .update({ title_pt, description_pt })
                        .eq('id', listing.id);

                    if (updateError) {
                        console.error(`Error actualizando el anuncio ${listing.id}:`, updateError);
                    } else {
                        count++;
                    }
                } else {
                    console.error(`Traducción fallida para el anuncio ${listing.id}, ignorando...`);
                }

                // Pequeña pausa para evitar límites de rate
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Excepción al traducir anuncio ${listing.id}:`, err);
            }
        }

        return NextResponse.json({ 
            message: `Cron ejecutado correctamente. Traducidos ${count} anuncios.` 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
