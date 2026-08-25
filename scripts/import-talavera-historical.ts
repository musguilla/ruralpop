import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { TrendType, UnitType, MarketSource, SegmentType } from '../src/types/livestock';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MARKET_ID = '8b3d87fa-21d7-4f6c-b364-e4c13a2948c2';

const normalizeCategory = (raw: string) => {
        const lower = raw.toLowerCase().trim();
        
        // Vida
        if (lower.includes('ternero 1 a 3 semanas frison')) return 'terneros_1_3_semanas_frison';
        if (lower.includes('ternera 1 a 3 semanas frisona')) return 'terneras_1_3_semanas_frisona';
        if (lower.includes('ternero 1 a 3 semanas cruzado')) return 'terneros_1_3_semanas_cruzado';
        if (lower.includes('ternera 1 a 3 semanas cruzada')) return 'terneras_1_3_semanas_cruzada';
        if (lower.includes('ternero frison de 6 meses')) return 'terneros_frison_6m';
        if (lower.includes('ternera frisona 6 meses aptitud cárnica')) return 'terneras_frisona_6m_carnica';
        if (lower.includes('ternera frisona 6 meses aptitud láctea')) return 'terneras_frisona_6m_lactea';
        
        if (lower.includes('ternero cruzado 1ª')) return 'terneros_cruzado_1a_200kg';
        if (lower.includes('ternero cruzado 2ª')) return 'terneros_cruzado_2a_200kg';
        if (lower.includes('ternera cruzada 1ª')) return 'terneras_cruzada_1a_200kg';
        if (lower.includes('ternera cruzada 2ª')) return 'terneras_cruzada_2a_200kg';
        
        if (lower.includes('ternero del pais')) return 'terneros_pais_200kg';
        if (lower.includes('ternera del pais')) return 'terneras_pais_200kg';
        
        if (lower.includes('vaca avileña')) return 'vacas_avilena';
        if (lower.includes('vaca retinta')) return 'vacas_retinta';
        if (lower.includes('vaca cruzada')) return 'vacas_cruzada';
        
        // Abasto Vivo
        if (lower === 'ternera cruzada' || lower === 'ternera cruzada ') return 'ternera_cruzada_abasto';
        if (lower === 'añojo cruzado' || lower === 'añojo cruzado ') return 'anojo_cruzado_abasto';
        if (lower.includes('toro del pais 1ª')) return 'toro_pais_1a';
        if (lower.includes('toro del pais 2ª')) return 'toro_pais_2a';
        if (lower.includes('vacas 1ª')) return 'vacas_1a';
        if (lower.includes('vacas 2ª')) return 'vacas_2a';
        
        // Abasto Canal
        if (lower.includes('ternera cruzada  200/250 kg. - u') || lower.includes('ternera cruzada 200/250 kg. - u')) return 'ternera_cruzada_200_250_U';
        if (lower.includes('ternera cruzada  200/250 kg. - r') || lower.includes('ternera cruzada 200/250 kg. - r')) return 'ternera_cruzada_200_250_R';
        if (lower.includes('ternera cruzada  251/300 kg. - u') || lower.includes('ternera cruzada 251/300 kg. - u')) return 'ternera_cruzada_251_300_U';
        if (lower.includes('ternera cruzada  251/300 kg. - r') || lower.includes('ternera cruzada 251/300 kg. - r')) return 'ternera_cruzada_251_300_R';
        
        if (lower.includes('añojo cruzado  331/370 kg. - u') || lower.includes('añojo cruzado 331/370 kg. - u')) return 'anojo_cruzado_331_370_U';
        if (lower.includes('añojo cruzado  331/370 kg. - r') || lower.includes('añojo cruzado 331/370 kg. - r')) return 'anojo_cruzado_331_370_R';
        if (lower.includes('+371 kg. - u') || lower.includes('+ 371 kg. - u')) return 'anojo_cruzado_mas_371_U';
        if (lower.includes('+371 kg. - r') || lower.includes('+ 371 kg. - r')) return 'anojo_cruzado_mas_371_R';

        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
};

const URLS = [
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260819.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260812.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260805.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260729.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250716.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250723.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250730.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250813.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250820.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250827.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250903.pdf",
"https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/pistacho/Mesa_Vacuno_20250910.pdf"
];

async function main() {
    const prices: any[] = [];
    const mod: any = await import('pdf-parse');
    const PDFP = mod.default || mod.PDFParse || mod;

    for (const url of URLS) {
        console.log(`Fetching ${url}...`);
        
        const matchDate = url.match(/Mesa_Vacuno_(\d{4})(\d{2})(\d{2})/);
        if (!matchDate) {
            console.error(`Could not extract date from ${url}`);
            continue;
        }
        
        const dateStr = `${matchDate[1]}-${matchDate[2]}-${matchDate[3]}`;
        const foundDate = new Date(dateStr);
        
        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (!response.ok) {
                console.error(`Failed to fetch ${url}: ${response.status}`);
                continue;
            }
            const pdfBuffer = await response.arrayBuffer();
            
            let text = '';
            if (typeof PDFP === 'function' && !PDFP.prototype?.getText) {
                const data = await PDFP(Buffer.from(pdfBuffer));
                text = data.text;
            } else {
                const parser = new PDFP(new Uint8Array(pdfBuffer));
                let data;
                if (typeof parser.getText === 'function') {
                     data = await parser.getText();
                } else {
                     data = await parser.parse();
                }
                text = data.text;
            }
            
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            let currentSegment: SegmentType = 'vida';
            
            for (let i = 0; i < lines.length; i++) {
                const rawLine = lines[i];
                const upperLine = rawLine.toUpperCase();
                
                if (upperLine.includes('VACUNO DE VIDA') || upperLine.includes('VACUNO PARA CEBO')) {
                    currentSegment = 'vida';
                    continue;
                } else if (upperLine.includes('VACUNO DE ABASTO') || upperLine.includes('VACUNO PARA SACRIFICIO')) {
                    currentSegment = 'abasto';
                    continue;
                }
                
                if (upperLine.includes('TIPOS DE GANADO') || upperLine.includes('PRECIO ANTERIOR')) continue;
                
                const match = rawLine.match(/^(.+?)\s+([\d,.]+)\s+([\d,.]+)\s+(Unidad|Kg\.\/v\.|Kg\.\/c\.)$/i);
                
                if (match) {
                    const categoryName = match[1].trim();
                    const rawPrice = match[3];
                    const currentPrice = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                    const unitStr = match[4].toLowerCase();
                    
                    let unit: UnitType = 'eur_unidad';
                    if (unitStr.includes('kg./v.')) unit = 'eur_kg_vivo';
                    else if (unitStr.includes('kg./c.')) unit = 'eur_kg_canal';
                    
                    let finalCategoryName = categoryName;
                    const upperCat = categoryName.toUpperCase();
                    
                    if (upperCat.startsWith('TORO DEL PAIS')) {
                        finalCategoryName = `TOROS DEL PAIS - ${categoryName.replace('TORO DEL PAIS ', '')}`;
                    } else if (upperCat.startsWith('VACAS') && !upperCat.includes('VACA ')) {
                        finalCategoryName = `VACAS - ${categoryName}`;
                    } else if (upperCat.includes('1 A 3 SEMANAS')) {
                        finalCategoryName = `TERNEROS 1 A 3 SEMANAS - ${categoryName}`;
                    } else if (upperCat.includes('6 MESES')) {
                        finalCategoryName = `TERNEROS 6 MESES - ${categoryName}`;
                    } else if (upperCat.includes('VACA AVILEÑA') || upperCat.includes('VACA RETINTA') || upperCat.includes('VACA CRUZADA') || upperCat.includes('VACA CHAROLAISE')) {
                        finalCategoryName = `VACAS DE VIDA - ${categoryName}`;
                    } else if (upperCat.includes('TERNERA CRUZADA 1ª') || upperCat.includes('TERNERA CRUZADA 2ª')) {
                        finalCategoryName = `TERNERA CRUZADA (BASE 200 KG) - ${categoryName}`;
                    } else if (upperCat.includes('TERNERO CRUZADO 1ª') || upperCat.includes('TERNERO CRUZADO 2ª')) {
                        finalCategoryName = `TERNERO CRUZADO (BASE 200 KG) - ${categoryName}`;
                    } else if (upperCat.includes('TERNERO DEL PAIS')) {
                        finalCategoryName = `TERNERO DEL PAÍS - ${categoryName}`;
                    } else if (upperCat.includes('TERNERA DEL PAIS')) {
                        finalCategoryName = `TERNERA DEL PAÍS - ${categoryName}`;
                    } else if (!categoryName.includes('-')) {
                        const words = categoryName.split(' ');
                        if (words.length > 2) {
                            finalCategoryName = `${words[0]} ${words[1]} - ${categoryName}`;
                        } else {
                            finalCategoryName = `${words[0]} - ${categoryName}`;
                        }
                    }
                    
                    if (!isNaN(currentPrice) && currentPrice > 0) {
                        prices.push({
                            date: foundDate.toISOString().split('T')[0],
                            market_source_id: MARKET_ID,
                            species: 'bovino',
                            segment: currentSegment,
                            category_name: finalCategoryName,
                            normalized_category: normalizeCategory(categoryName),
                            price_avg: currentPrice,
                            unit: unit,
                            trend: 'unknown' as TrendType
                        });
                    }
                }
            }
        } catch (e) {
            console.error(`Error processing ${url}:`, e);
        }
    }
    
    console.log(`Found ${prices.length} prices to insert.`);
    
    const chunkSize = 2000;
    for (let i = 0; i < prices.length; i += chunkSize) {
        const chunk = prices.slice(i, i + chunkSize);
        
        const seen = new Set();
        const uniqueChunk = [];
        for (const p of chunk) {
            const key = `${p.market_source_id}_${p.date}_${p.category_name}_${p.unit}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueChunk.push(p);
            }
        }
        
        const { error } = await supabase.from('livestock_prices').upsert(uniqueChunk, { onConflict: 'market_source_id,date,category_name,unit' });
        if (error) {
            console.error('Error inserting chunk:', error);
        } else {
            console.log(`Inserted chunk of ${uniqueChunk.length} prices.`);
        }
    }
    
    console.log("Done.");
}

main().catch(console.error);
