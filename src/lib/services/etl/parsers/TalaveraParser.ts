import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class TalaveraParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        try {
            // 1. Dynamic URL Discovery
            const today = new Date();
            const validResults: { pdfBuffer: ArrayBuffer, foundDate: Date, foundUrl: string }[] = [];
            
            // Start from today and go back up to 14 days
            for (let i = 0; i < 14; i++) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - i);
                
                const year = targetDate.getFullYear();
                const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                const day = String(targetDate.getDate()).padStart(2, '0');
                
                const dateStr = `${year}${month}${day}`;
                const url = `https://www.talavera-ferial.com/editor/itfile/0/std/LONJA_AGROPECUARIA/VACUNO/Mesa_Vacuno_${dateStr}.pdf`;
                
                try {
                    const response = await fetch(url, {
                        cache: 'no-store',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    
                    const contentType = response.headers.get('content-type');
                    if (response.ok && contentType?.includes('application/pdf')) {
                        validResults.push({
                            pdfBuffer: await response.arrayBuffer(),
                            foundDate: new Date(`${year}-${month}-${day}T12:00:00Z`),
                            foundUrl: url
                        });
                    }
                } catch (fetchErr) {
                    // Ignore individual fetch errors (like timeouts or 404s) and continue
                }
            }
            
            // Sort descending by date (newest first)
            validResults.sort((a, b) => b.foundDate.getTime() - a.foundDate.getTime());
            
            if (validResults.length === 0) {
                throw new Error('Could not find any valid Talavera PDF in the last 14 days.');
            }
            
            const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
            const rawContents: string[] = [];
            
            // 2. Parse ALL valid PDFs found
            for (const item of validResults) {
                const { pdfBuffer, foundDate, foundUrl } = item;
                
                try {
                    let text = '';
                    const mod: any = await import('pdf-parse');
                    const PDFP = mod.default || mod.PDFParse || mod;
                    
                    if (typeof PDFP === 'function' && !PDFP.prototype?.getText) {
                        // Classical pdf-parse usage
                        const data = await PDFP(Buffer.from(pdfBuffer));
                        text = data.text;
                    } else {
                        // Alternative/Fork usage
                        const parser = new PDFP(new Uint8Array(pdfBuffer));
                        const result = await parser.getText();
                        text = result.text;
                    }
                    
                    if (!text || text.trim() === '') {
                        throw new Error("El PDF fue parseado pero el texto resultante está vacío.");
                    }
                    
                    rawContents.push(`--- PDF: ${foundUrl} ---`);
                    rawContents.push(text);
                    
                    // 3. Parse lines
                    const lines = text.split('\n');
                    let currentSegment: SegmentType = 'vida';
                    
                    for (const line of lines) {
                        const rawLine = line.trim();
                        const upperLine = rawLine.toUpperCase();
                        
                        if (!rawLine) continue;
                        
                        // Detect segments
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
                        
                        // Exclude headers
                        if (upperLine.includes('TIPOS DE GANADO') || upperLine.includes('PRECIO ANTERIOR')) continue;
                        
                        // Regex to capture Category Name, Previous Price, Current Price, and Unit
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
                                    date: foundDate, // Assigns the date of the specific PDF document
                                    species: 'bovino',
                                    segment: currentSegment,
                                    category_name: finalCategoryName,
                                    normalized_category: TalaveraParser.normalizeCategory(categoryName),
                                    price_avg: currentPrice,
                                    unit: unit,
                                    trend: 'unknown' as TrendType
                                });
                            }
                        }
                    }
                } catch (pdfErr) {
                    console.warn(`Failed to parse Talavera PDF at ${foundUrl}:`, pdfErr);
                    // Silently continue to the next valid PDF rather than crashing the entire batch
                }
       }
            return {
                prices,
                rawContent: rawContents.join('\n\n'),
                contentType: 'application/pdf'
            };
            
        } catch (error) {
            console.error('TalaveraParser error:', error);
            throw error;
        }
    }
    
    static normalizeCategory(raw: string): string {
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
    }
}
