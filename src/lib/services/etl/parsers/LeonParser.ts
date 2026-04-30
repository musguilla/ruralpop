import * as cheerio from 'cheerio';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class LeonParser {
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        try {
            // 1. Dynamic URL Discovery
            let htmlText = '';
            let foundDate: Date | null = null;
            let foundUrl = '';
            
            const today = new Date();
            for (let i = 0; i < 14; i++) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - i);
                
                const year = targetDate.getFullYear();
                const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                const day = String(targetDate.getDate()).padStart(2, '0');
                
                // Try both formats
                const urls = [
                    `https://www.lonjadeleon.es/lonja-carne-de-vacuno-${day}-${month}-${year}/`,
                    `https://www.lonjadeleon.es/lonja-carne-vacuno-${day}-${month}-${year}/`
                ];
                
                for (const url of urls) {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    if (response.ok) {
                        htmlText = await response.text();
                        foundDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
                        foundUrl = url;
                        break;
                    }
                }
                if (foundDate) break;
            }
            
            if (!foundDate || !htmlText) {
                throw new Error('Could not find any valid Leon HTML in the last 14 days.');
            }
            
            return await LeonParser.parseHtml(htmlText, foundDate, foundUrl);
        } catch (error) {
            console.error('LeonParser error:', error);
            throw error;
        }
    }
    
    // Extracted out so the historical script can reuse it directly
    static async parseHtml(htmlText: string, foundDate: Date, foundUrl: string): Promise<ETLParserResult> {
        const $ = cheerio.load(htmlText);
        const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
        
        const rows = $('table').first().find('tr');
        
        let currentSegment: SegmentType = 'vida';
        let currentUnit: UnitType = 'eur_kg_vivo';
        let currentParentCategory = '';
        
        rows.each((i, row) => {
            const cells = $(row).find('td, th').map((j, cell) => $(cell).text().trim()).get();
            if (cells.length < 2) return;
            
            const col0 = cells[0];
            const col1 = cells[1];
            
            // Skip empty rows
            if (!col0) return;
            
            // Is it a segment header? (indicated by unit in col1)
            if (col1.includes('€/')) {
                const unitStr = col1.toLowerCase();
                if (unitStr.includes('unidad')) currentUnit = 'eur_unidad';
                else if (unitStr.includes('canal')) currentUnit = 'eur_kg_canal';
                else currentUnit = 'eur_kg_vivo';
                
                if (col0.toUpperCase().includes('VIDA')) currentSegment = 'vida';
                else currentSegment = 'abasto';
                
                currentParentCategory = '';
                return;
            }
            
            // Skip main table headers
            if (col0 === 'VACUNO' || col0 === 'COTIZACION ANTERIOR') return;
            
            // Is it a parent category grouping? (col0 has text, col1 is empty)
            if (col0 && !col1) {
                currentParentCategory = col0;
                return;
            }
            
            // Is it a data row?
            if (col0 && col1) {
                if (col1 === '=') return; // Skip invalid prices
                
                const categoryName = currentParentCategory ? `${currentParentCategory} - ${col0}` : col0;
                
                let price_min = null;
                let price_max = null;
                let price_avg = 0;
                
                // Parse ranges like "4,40/5,40"
                if (col1.includes('/')) {
                    const parts = col1.split('/').map(p => parseFloat(p.replace(/\./g, '').replace(',', '.')));
                    if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                        price_min = parts[0];
                        price_max = parts[1];
                        price_avg = (price_min + price_max) / 2;
                    }
                } else {
                    price_avg = parseFloat(col1.replace(/\./g, '').replace(',', '.'));
                }
                
                if (isNaN(price_avg) || price_avg <= 0) return;
                
                prices.push({
                    date: foundDate,
                    species: 'bovino',
                    segment: currentSegment,
                    category_name: categoryName,
                    normalized_category: LeonParser.normalizeCategory(categoryName),
                    price_min,
                    price_max,
                    price_avg,
                    unit: currentUnit,
                    trend: 'unknown' as TrendType
                });
            }
        });
        
        return {
            prices,
            rawContent: `--- URL: ${foundUrl} ---\n${htmlText.substring(0, 500)}...`,
            contentType: 'text/html'
        };
    }
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        
        if (lower.includes('frisones')) return 'terneros_frison_vida_leon';
        if (lower.includes('pasteros macho')) return 'pasteros_machos_200kg_leon';
        if (lower.includes('pasteros hembra')) return 'pasteros_hembras_200kg_leon';
        
        // Abasto
        if (lower.includes('hembras') && lower.includes('180-200')) {
            if (lower.includes(' u')) return 'hembras_180_200_u_leon';
            if (lower.includes(' r')) return 'hembras_180_200_r_leon';
            if (lower.includes(' o')) return 'hembras_180_200_o_leon';
        }
        if (lower.includes('hembras') && lower.includes('201-250')) {
            if (lower.includes(' u')) return 'hembras_201_250_u_leon';
            if (lower.includes(' r')) return 'hembras_201_250_r_leon';
            if (lower.includes(' o')) return 'hembras_201_250_o_leon';
        }
        if (lower.includes('hembras') && lower.includes('más 250')) {
            if (lower.includes(' u')) return 'hembras_mas_250_u_leon';
            if (lower.includes(' r')) return 'hembras_mas_250_r_leon';
            if (lower.includes(' o')) return 'hembras_mas_250_o_leon';
        }
        
        if (lower.includes('machos') && lower.includes('200-250')) {
            if (lower.includes(' u')) return 'machos_200_250_u_leon';
            if (lower.includes(' r')) return 'machos_200_250_r_leon';
            if (lower.includes(' o')) return 'machos_200_250_o_leon';
        }
        if (lower.includes('machos') && lower.includes('251-300')) {
            if (lower.includes(' u')) return 'machos_251_300_u_leon';
            if (lower.includes(' r')) return 'machos_251_300_r_leon';
            if (lower.includes(' o')) return 'machos_251_300_o_leon';
        }
        if (lower.includes('machos') && lower.includes('más de 300')) {
            if (lower.includes(' u')) return 'machos_mas_300_u_leon';
            if (lower.includes(' r')) return 'machos_mas_300_r_leon';
            if (lower.includes(' o')) return 'machos_mas_300_o_leon';
        }
        
        // Sacrificio
        if (lower.includes('fábrica y segunda')) return 'vacas_sacrificio_fabrica_segunda_leon';
        if (lower.includes('primera y extra')) return 'vacas_sacrificio_primera_extra_leon';
        
        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }
}
