import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// NOTA: Para usar esto gratuitamente, instala una librería como `google-translate-api-x`
// Ejecuta: npm install google-translate-api-x
// Y descomenta el import de abajo:
// import translate from 'google-translate-api-x';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Función mock para traducir textos si no tienes librería.
 * Deberás reemplazarla por la librería real.
 */
async function translateText(text: string, targetLang = 'pt') {
    if (!text) return text;
    
    // --- EJEMPLO CON google-translate-api-x ---
    // try {
    //     const res = await translate(text, { to: targetLang });
    //     return res.text;
    // } catch (e) {
    //     console.error("Error en la traducción", e);
    //     return text;
    // }

    return text;
}

export async function GET(request: Request) {
    // 1. Verificación de Seguridad: Asegurar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // 2. Obtener anuncios activos sin traducir
        // Limitar a 20 por ejecución para no exceder los 10 segundos de límite en Vercel Serverless (Plan Hobby)
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

                const { error: updateError } = await supabaseAdmin
                    .from('listings')
                    .update({ title_pt, description_pt })
                    .eq('id', listing.id);

                if (updateError) {
                    console.error(`Error actualizando el anuncio ${listing.id}:`, updateError);
                } else {
                    count++;
                }

                // Pequeña pausa para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 300));
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
