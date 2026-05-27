import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SieroParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // 1. Fetch Siero Market Page
        const response = await fetch(source.source_url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Siero API returned ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
        let rawContentMerged = '';
        
        // 2. Find links to PDFs. We look for "Precios Lunes Vida", "Precio Lunes Abasto", "Precios Jueves Terneros"
        const pdfLinks: { url: string, type: string }[] = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().toLowerCase();
            if (href && href.endsWith('.pdf')) {
                if (text.includes('precio') || text.includes('cotización')) {
                    if (text.includes('vida')) pdfLinks.push({ url: href, type: 'vida' });
                    else if (text.includes('abasto')) pdfLinks.push({ url: href, type: 'abasto' });
                    else if (text.includes('terneros') || text.includes('jueves')) pdfLinks.push({ url: href, type: 'recría' });
                }
            }
        });
        
        // Only process the first set of links (the most recent ones)
        // Let's assume the first 'vida', 'abasto', and 'recría' are the latest.
        const processedTypes = new Set<string>();
        
        for (const link of pdfLinks) {
            if (processedTypes.has(link.type)) continue;
            processedTypes.add(link.type);
            
            // Ensure absolute URL
            const absoluteUrl = link.url.startsWith('http') ? link.url : `https://www.ayto-siero.es${link.url}`;
            
            try {
                // Fetch the PDF
                const pdfRes = await fetch(absoluteUrl, { cache: 'no-store' });
                if (!pdfRes.ok) continue;
                
                const arrayBuffer = await pdfRes.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);
                
                // Extract text
                const parser = new PDFParse(buffer);
                const result = await parser.getText();
                rawContentMerged += `\n\n--- PDF: ${link.url} ---\n${result.text}`;
                
                // Extract Date from URL or text
                // URL usually has date: precios-lunes-vida-20-10-25.pdf
                const dateMatch = absoluteUrl.match(/(\d{2})-(\d{2})-(\d{2,4})/);
                let date = new Date();
                if (dateMatch) {
                    const [, d, m, y] = dateMatch;
                    const fullYear = y.length === 2 ? `20${y}` : y;
                    date = new Date(`${fullYear}-${m}-${d}T12:00:00Z`);
                }
                
                // Basic Line Parsing
                const lines = result.text.split('\n');
                let currentHeader = '';
                
                for (const line of lines) {
                    const rawLine = line.trim();
                    const upperLine = rawLine.toUpperCase();

                    if (!rawLine) continue;

                    // Check for Headers
                    if (upperLine.includes('TERNERAS ENTRE 150-250')) { currentHeader = 'Terneras 150-250kg'; continue; }
                    if (upperLine.includes('TERNEROS ENTRE 150-250')) { currentHeader = 'Terneros 150-250kg'; continue; }
                    if (upperLine === 'CULONES' || upperLine === 'CULONES\r') { currentHeader = 'Culones Abasto'; continue; }
                    if (upperLine.includes('VACUNO MAYOR')) { currentHeader = 'Vacuno Mayor'; continue; }
                    
                    if (upperLine.includes('PASTEROS (HEMBRAS)')) { currentHeader = 'Pasteros Hembras'; continue; }
                    if (upperLine.includes('PASTEROS (MACHOS)')) { currentHeader = 'Pasteros Machos'; continue; }
                    if (upperLine.includes('CULONES PARA VIDA - MACHOS')) { currentHeader = 'Culones Vida Machos'; continue; }
                    if (upperLine.includes('CULONES PARA VIDA- HEMBRAS') || upperLine.includes('CULONES PARA VIDA - HEMBRAS')) { currentHeader = 'Culones Vida Hembras'; continue; }
                    if (upperLine.includes('NOVILLAS DE CUBRICIÓN') || upperLine.includes('NOVILLAS DE CUBRICION')) { currentHeader = 'Novillas Cubrición'; continue; }
                    if (upperLine.includes('NOVILLAS PRÓXIMAS 1ER. PARTO') || upperLine.includes('NOVILLAS PRÓXIMAS 1ER PARTO')) { currentHeader = 'Novillas Próximas 1er Parto'; continue; }
                    if (upperLine.includes('VACAS 1º - 4º PARTO') || upperLine.includes('VACAS 1º-4º PARTO')) { currentHeader = 'Vacas 1-4 Parto'; continue; }
                    if (upperLine.includes('VACAS 5º PARTO Y SIGUIENTES')) { currentHeader = 'Vacas 5+ Parto'; continue; }

                    // Skip table headers and noise
                    if (upperLine.includes('DESCRIPCION') || upperLine.includes('DESCRIPCIÓN') || upperLine.includes('EUROS') || upperLine.includes('P. MÍNIMO') || upperLine.includes('PRECIO MÁXIMO') || upperLine.includes('FRECUENTE')) continue;
                    
                    // Match Text followed by 1, 2, or 3 numbers
                    const priceMatch = rawLine.match(/^(.+?)\s+([\d,.]+)(?:\s+([\d,.]+))?(?:\s+([\d,.]+))?$/);
                    
                    if (priceMatch && currentHeader) {
                        let rawCategory = priceMatch[1].trim();
                        if (rawCategory.length < 2 || rawCategory.toLowerCase().includes('precio')) continue; // skip noise
                        
                        // Clean up redundant units from the PDF text to make the title cleaner
                        rawCategory = rawCategory.replace(/\(K\.C\.\)/i, '').replace(/\(UD\.\)/i, '').trim();
                        if (!rawCategory || rawCategory.toLowerCase() === 'unidad') rawCategory = 'General';
                        
                        const val1 = parseFloat(priceMatch[2].replace(/\./g, '').replace(',', '.'));
                        const val2 = priceMatch[3] ? parseFloat(priceMatch[3].replace(/\./g, '').replace(',', '.')) : null;
                        const val3 = priceMatch[4] ? parseFloat(priceMatch[4].replace(/\./g, '').replace(',', '.')) : null;
                        
                        const priceMin = val1;
                        const priceAvg = val2 !== null ? val2 : val1;
                        const priceMax = val3 !== null ? val3 : (val2 !== null ? val2 : val1);
                        
                        if (isNaN(priceAvg) || priceAvg <= 0) continue;
                        
                        let segment: SegmentType = 'vida';
                        let unit: UnitType = 'eur_unidad';
                        
                        if (link.type === 'abasto') {
                            segment = 'abasto';
                            unit = 'eur_kg_canal';
                        } else if (link.type === 'recría') {
                            segment = 'recría';
                            unit = 'eur_unidad';
                        }
                        
                        const categoryName = `${currentHeader} - ${rawCategory}`;
                        
                        prices.push({
                            date,
                            species: 'bovino',
                            segment,
                            category_name: categoryName,
                            normalized_category: SieroParser.normalizeCategory(categoryName),
                            price_min: priceMin,
                            price_max: priceMax,
                            price_avg: priceAvg,
                            unit,
                            trend: 'unknown' as TrendType
                        });
                    }
                }
            } catch (err) {
                console.error(`SieroParser Error reading PDF ${link.url}:`, err);
            }
        }
        
        return {
            prices,
            rawContent: rawContentMerged,
            contentType: 'text/plain' // Since we extracted text from PDF
        };
    }
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        
        // Abasto
        if (lower.includes('vacuno mayor')) {
            if (lower.includes('extra')) return 'vacuno_mayor_extra';
            if (lower.includes('primera')) return 'vacuno_mayor_primera';
            if (lower.includes('segunda')) return 'vacuno_mayor_segunda';
            if (lower.includes('desecho')) return 'vacuno_mayor_desecho';
        }
        
        if (lower.includes('terneras') && lower.includes('150-250')) {
            if (lower.includes('primera')) return 'terneras_150_250_primera';
            if (lower.includes('segunda')) return 'terneras_150_250_segunda';
        }

        if (lower.includes('terneros') && lower.includes('150-250')) {
            if (lower.includes('primera')) return 'terneros_150_250_primera';
            if (lower.includes('segunda')) return 'terneros_150_250_segunda';
        }
        
        if (lower.includes('culones abasto')) {
            if (lower.includes('<220') || lower.includes('menos 220')) return 'culones_abasto_menos_220';
            if (lower.includes('220 a 300')) return 'culones_abasto_220_300';
            if (lower.includes('>= 300') || lower.includes('>=300') || lower.includes('mas 300')) return 'culones_abasto_mas_300';
        }

        // Vida
        if (lower.includes('pasteros hembras')) return 'pasteros_hembras';
        if (lower.includes('pasteros machos')) return 'pasteros_machos';
        
        if (lower.includes('culones vida machos')) {
            if (lower.includes('hasta 3')) return 'culones_vida_machos_hasta_3m';
            if (lower.includes('de 3 a 6')) return 'culones_vida_machos_3_6m';
        }

        if (lower.includes('culones vida hembras')) {
            if (lower.includes('hasta 3')) return 'culones_vida_hembras_hasta_3m';
            if (lower.includes('de 3 a 6')) return 'culones_vida_hembras_3_6m';
        }
        
        if (lower.includes('novillas cubrición') || lower.includes('novillas cubricion')) {
            if (lower.includes('asturiana')) return 'novillas_cubricion_asturiana';
            if (lower.includes('cruces')) return 'novillas_cubricion_cruces';
        }
        
        if (lower.includes('novillas próximas') || lower.includes('1er parto')) {
            if (lower.includes('asturiana')) return 'novillas_1er_parto_asturiana';
            if (lower.includes('cruces')) return 'novillas_1er_parto_cruces';
        }
        
        if (lower.includes('vacas 1-4 parto') || lower.includes('vacas 1º - 4º parto')) {
            if (lower.includes('asturiana')) return 'vacas_1_4_parto_asturiana';
            if (lower.includes('cruces')) return 'vacas_1_4_parto_cruces';
        }
        
        if (lower.includes('vacas 5+ parto') || lower.includes('5º parto y siguientes')) {
            if (lower.includes('asturiana')) return 'vacas_5_parto_mas_asturiana';
            if (lower.includes('cruces')) return 'vacas_5_parto_mas_cruces';
        }

        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }
}
