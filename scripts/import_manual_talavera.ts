import { createClient } from '@supabase/supabase-js';
import { TrendType, UnitType, SegmentType } from '../src/types/livestock';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: source } = await supabase.from('market_sources').select('*').ilike('name', '%Talavera%').single();
    if (!source) {
        console.error("Talavera no encontrada en BD");
        return;
    }

    const urls = [
        { url: "https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260826.pdf", date: "2026-08-26" },
        { url: "https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260902.pdf", date: "2026-09-02" },
        { url: "https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260909.pdf", date: "2026-09-09" },
        { url: "https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260916.pdf", date: "2026-09-16" },
        { url: "https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260923.pdf", date: "2026-09-23" }
    ];

    const { TalaveraParser } = await import('../src/lib/services/etl/parsers/TalaveraParser');

    for (const {url, date} of urls) {
        console.log("Fetching", url);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const pdfBuffer = await response.arrayBuffer();
        
        let text = '';
        const mod: any = await import('pdf-parse');
        const PDFP = mod.default || mod.PDFParse || mod;
        
        if (typeof PDFP === 'function' && !PDFP.prototype?.getText) {
            const data = await PDFP(Buffer.from(pdfBuffer));
            text = data.text;
        } else {
            const parser = new PDFP(new Uint8Array(pdfBuffer));
            const result = await parser.getText();
            text = result.text;
        }

        const lines = text.split('\n');
        let currentSegment: SegmentType = 'vida';
        const prices: any[] = [];
        
        for (const line of lines) {
            const rawLine = line.trim();
            const upperLine = rawLine.toUpperCase();
            
            if (!rawLine) continue;
            
            if (upperLine.includes('VACUNO DE VIDA')) { currentSegment = 'vida'; continue; }
            if (upperLine.includes('VACUNO DE ABASTO VIVO')) { currentSegment = 'abasto'; continue; }
            if (upperLine.includes('VACUNO DE ABASTO PRECIO CANAL')) { currentSegment = 'abasto'; continue; }
            
            if (upperLine.includes('TIPOS DE GANADO') || upperLine.includes('PRECIO ANTERIOR')) continue;
            
            const match = rawLine.match(/^(.+?)\s+([\d,.]+)\s+([\d,.]+)\s+(Unidad|Kg\.\/v\.|Kg\.\/c\.)$/i);
            
            if (match) {
                const categoryName = match[1].trim();
                const prevPriceRaw = match[2];
                const rawPrice = match[3];
                const prevPrice = parseFloat(prevPriceRaw.replace(/\./g, '').replace(',', '.'));
                const currentPrice = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                const unitStr = match[4].toLowerCase();
                
                let unit: UnitType = 'eur_unidad';
                if (unitStr.includes('kg./v.')) unit = 'eur_kg_vivo';
                else if (unitStr.includes('kg./c.')) unit = 'eur_kg_canal';
                
                let finalCategoryName = categoryName;
                const upperCat = categoryName.toUpperCase();
                
                if (upperCat.startsWith('TORO DEL PAIS')) finalCategoryName = `TOROS DEL PAIS - ${categoryName.replace('TORO DEL PAIS ', '')}`;
                else if (upperCat.startsWith('VACAS') && !upperCat.includes('VACA ')) finalCategoryName = `VACAS - ${categoryName}`;
                else if (upperCat.includes('1 A 3 SEMANAS')) finalCategoryName = `TERNEROS 1 A 3 SEMANAS - ${categoryName}`;
                else if (upperCat.includes('6 MESES')) finalCategoryName = `TERNEROS 6 MESES - ${categoryName}`;
                else if (upperCat.includes('VACA AVILEÑA') || upperCat.includes('VACA RETINTA') || upperCat.includes('VACA CRUZADA') || upperCat.includes('VACA CHAROLAISE')) finalCategoryName = `VACAS DE VIDA - ${categoryName}`;
                else if (upperCat.includes('TERNERA CRUZADA 1ª') || upperCat.includes('TERNERA CRUZADA 2ª')) finalCategoryName = `TERNERA CRUZADA (BASE 200 KG) - ${categoryName}`;
                else if (upperCat.includes('TERNERO CRUZADO 1ª') || upperCat.includes('TERNERO CRUZADO 2ª')) finalCategoryName = `TERNERO CRUZADO (BASE 200 KG) - ${categoryName}`;
                else if (upperCat.includes('TERNERO DEL PAIS')) finalCategoryName = `TERNERO DEL PAÍS - ${categoryName}`;
                else if (upperCat.includes('TERNERA DEL PAIS')) finalCategoryName = `TERNERA DEL PAÍS - ${categoryName}`;
                else if (!categoryName.includes('-')) {
                    const words = categoryName.split(' ');
                    if (words.length > 2) finalCategoryName = `${words[0]} ${words[1]} - ${categoryName}`;
                    else finalCategoryName = `${words[0]} - ${categoryName}`;
                }
                
                let trend: TrendType = 'unknown';
                if (!isNaN(prevPrice) && !isNaN(currentPrice)) {
                    if (currentPrice > prevPrice) trend = 'up';
                    else if (currentPrice < prevPrice) trend = 'down';
                    else trend = 'stable';
                }

                if (!isNaN(currentPrice) && currentPrice > 0) {
                    prices.push({
                        date: date,
                        market_source_id: source.id,
                        species: 'bovino',
                        segment: currentSegment,
                        category_name: finalCategoryName,
                        normalized_category: TalaveraParser.normalizeCategory(categoryName),
                        price_avg: currentPrice,
                        previous_price: isNaN(prevPrice) ? null : prevPrice,
                        unit: unit,
                        trend: trend
                    });
                }
            }
        }
        
        console.log(`Parsed ${prices.length} prices for ${url}`);
        if (prices.length > 0) {
            const { error: insertError } = await supabase
                .from('livestock_prices')
                .upsert(prices, { onConflict: 'market_source_id, date, category_name, unit', ignoreDuplicates: false });
                
            if (insertError) {
                console.error("Error inserting prices:", insertError);
            } else {
                console.log(`Successfully injected ${prices.length} prices for ${date}`);
            }
        }
    }

    // Actualizar fecha de éxito en market_sources
    await supabase
        .from('market_sources')
        .update({ 
            last_success_at: new Date().toISOString(),
            last_error_at: null 
        })
        .eq('id', source.id);

    console.log("¡Completada la inserción de todas las mesas de Talavera!");
}
run();
