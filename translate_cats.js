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
            system: `Eres un traductor experto. Traduce esta categoría o subcategoría al ${targetLang}. Devuelve ÚNICAMENTE la traducción, sin explicaciones ni comillas.`,
            messages: [{ role: "user", content: text }]
        });
        return msg.content[0]?.text?.trim() || null;
    } catch (e) {
        console.error("Error API Claude:", e.status || e.message);
        return null;
    }
}

async function run() {
    console.log("Traduciendo Categorías...");
    const { data: categories } = await supabaseAdmin.from('categories').select('id, name').is('name_pt', null);
    for (const c of (categories || [])) {
        const pt = await translateText(c.name);
        if (pt) await supabaseAdmin.from('categories').update({ name_pt: pt }).eq('id', c.id);
        console.log(`Categoría: ${c.name} -> ${pt}`);
        await new Promise(r => setTimeout(r, 200));
    }

    console.log("Traduciendo Subcategorías...");
    const { data: subcats } = await supabaseAdmin.from('subcategories').select('id, name').is('name_pt', null);
    for (const s of (subcats || [])) {
        const pt = await translateText(s.name);
        if (pt) await supabaseAdmin.from('subcategories').update({ name_pt: pt }).eq('id', s.id);
        console.log(`Subcategoría: ${s.name} -> ${pt}`);
        await new Promise(r => setTimeout(r, 200));
    }
}
run();
