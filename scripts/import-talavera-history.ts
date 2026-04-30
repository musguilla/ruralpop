import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { PDFParse } from 'pdf-parse';
import { TalaveraParser } from '../src/lib/services/etl/parsers/TalaveraParser';
import { TrendType, UnitType, SegmentType } from '../src/types/livestock';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const marketId = '8b3d87fa-21d7-4f6c-b364-e4c13a2948c2';

const urls = [
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260422.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260415.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260408.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260401.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260325.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260318.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260311.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260304.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260225.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260218.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260211.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260204.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260128.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260121.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260114.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20260107.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251230.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251223.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251217.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251211.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251203.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251126.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251119.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251112.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_202511105.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251029.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251022.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251015.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251008.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20251001.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250924.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250917.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/pistacho/Mesa_Vacuno_20250910.pdf',
    'https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_20250903.pdf'
];

async function run() {
    for (const url of urls) {
        try {
            console.log(`Processing ${url}...`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            });
            
            if (!response.ok) {
                console.error(`Failed to fetch ${url} - Status ${response.status}`);
                continue;
            }
            
            // Extract date from URL
            const dateMatch = url.match(/Mesa_Vacuno_(\d{8}|\d{9})\.pdf/i);
            let foundDate: Date;
            
            if (dateMatch) {
                let dateStr = dateMatch[1];
                // Handle the typo in '202511105' (probably meant 20251105)
                if (dateStr === '202511105') {
                    dateStr = '20251105';
                }
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                foundDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
            } else {
                console.error(`Could not extract date from ${url}`);
                continue;
            }
            
            const pdfBuffer = await response.arrayBuffer();
            const buffer = new Uint8Array(pdfBuffer);
            const parser = new PDFParse(buffer);
            const result = await parser.getText();
            const text = result.text;
            
            const prices: any[] = [];
            const lines = text.split('\n');
            let currentSegment: SegmentType = 'vida';
            
            for (const line of lines) {
                const rawLine = line.trim();
                const upperLine = rawLine.toUpperCase();
                
                if (!rawLine) continue;
                
                if (upperLine.includes('VACUNO DE VIDA')) {
                    currentSegment = 'vida';
                    continue;
                }
                if (upperLine.includes('VACUNO DE ABASTO VIVO')) {
                    currentSegment = 'abasto';
                    continue;
                }
                if (upperLine.includes('VACUNO DE ABASTO PRECIO CANAL')) {
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
                            date: foundDate,
                            market_source_id: marketId,
                            species: 'bovino',
                            segment: currentSegment,
                            category_name: finalCategoryName,
                            normalized_category: TalaveraParser.normalizeCategory(categoryName),
                            price_avg: currentPrice,
                            unit: unit,
                            trend: 'unknown'
                        });
                    }
                }
            }
            
            if (prices.length > 0) {
                const { error } = await supabase.from('livestock_prices').insert(prices);
                if (error) {
                    console.error(`Error inserting prices for ${url}:`, error);
                } else {
                    console.log(`Inserted ${prices.length} prices for ${foundDate.toISOString().split('T')[0]}`);
                }
            } else {
                console.warn(`No prices extracted from ${url}`);
            }
            
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }
    console.log('Finished processing all URLs.');
}

run();
