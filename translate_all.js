require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '', 
});

async function translateText(text, targetLang = 'Portugués') {
    if (!text || !process.env.ANTHROPIC_API_KEY) return null;
    
    try {
        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            temperature: 0.1,
            system: `Eres un traductor experto y profesional. Tu única tarea es traducir el texto proporcionado al ${targetLang}. Devuelve ÚNICAMENTE la traducción, sin explicaciones, sin comillas, ni texto adicional. Mantén el tono original.`,
            messages: [
                { role: "user", content: text }
            ]
        });
        
        return msg.content[0]?.text?.trim() || null;
    } catch (e) {
        console.error("Error API Claude:", e.status || e.message);
        return null;
    }
}

async function run() {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error("❌ ERROR: Falta la variable ANTHROPIC_API_KEY.");
        console.error("Ejecuta el script de esta manera:");
        console.error('ANTHROPIC_API_KEY="sk-ant-tu-clave" node translate_all.js');
        return;
    }

    console.log("Iniciando traducción masiva de anuncios...");
    
    let totalTraducidos = 0;
    let hasMore = true;
    const BATCH_SIZE = 50;

    while (hasMore) {
        // Obtener lote de anuncios sin traducir
        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select('id, title, description')
            .eq('status', 'active')
            .is('title_pt', null)
            .limit(BATCH_SIZE);

        if (error) {
            console.error("Error leyendo DB:", error);
            break;
        }

        if (!listings || listings.length === 0) {
            console.log("✅ ¡No quedan anuncios pendientes! Traducción completada.");
            hasMore = false;
            break;
        }

        console.log(`\nProcesando nuevo lote de ${listings.length} anuncios...`);

        // Procesar en lotes pequeños concurrentes para ir muy rápido sin colapsar la API
        for (const listing of listings) {
            try {
                const title_pt = await translateText(listing.title);
                const description_pt = await translateText(listing.description);

                if (title_pt) {
                    const { error: updateError } = await supabaseAdmin
                        .from('listings')
                        .update({ title_pt, description_pt })
                        .eq('id', listing.id);

                    if (!updateError) {
                        totalTraducidos++;
                        process.stdout.write("✓ ");
                    } else {
                        process.stdout.write("x ");
                    }
                } else {
                    process.stdout.write("- ");
                }
                
                // Pequeña pausa para rate-limits
                await new Promise(r => setTimeout(r, 200));

            } catch (e) {
                console.error(`\nError en el anuncio ${listing.id}:`, e.message);
            }
        }
        
        console.log(`\n=> Total acumulado traducidos: ${totalTraducidos}`);
    }
}

run();
