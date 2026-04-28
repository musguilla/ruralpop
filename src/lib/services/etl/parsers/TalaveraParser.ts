import * as cheerio from 'cheerio';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class TalaveraParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        try {
            const response = await fetch(source.source_url, {
                // Add common headers to avoid simple 503 blocks from CDNs
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Talavera API returned ${response.status}`);
            }
            
            const html = await response.text();
            const $ = cheerio.load(html);
            
            const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
            
            // Assuming standard HTML table for prices
            const rows = $('table tr');
            
            // Extract Date - Usually in the page title or table header
            const titleText = $('h1, h2, .title').text().trim();
            const dateMatch = titleText.match(/(\d{1,2})\s+de\s+([a-zA-Z]+)\s+de\s+(\d{4})/);
            let date = new Date(); // fallback
            
            if (dateMatch) {
                const day = dateMatch[1];
                const monthStr = dateMatch[2].toLowerCase();
                const year = dateMatch[3];
                const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                const month = months.indexOf(monthStr) + 1;
                if (month > 0) {
                    date = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
                }
            }
            
            let currentSegment: SegmentType = 'vida';
            let currentUnit: UnitType = 'eur_kg_vivo';
            
            rows.each((i, row) => {
                const cells = $(row).find('td, th');
                if (cells.length < 2) return;
                
                const firstCell = $(cells[0]).text().trim().toUpperCase();
                
                // Try to detect segment
                if (firstCell.includes('VIDA')) currentSegment = 'vida';
                if (firstCell.includes('ABASTO') || firstCell.includes('CARNE')) currentSegment = 'abasto';
                
                const categoryName = $(cells[0]).text().trim();
                const priceText = $(cells[1]).text().trim().replace(',', '.');
                
                // Match exact price or range
                let priceMin, priceMax, priceAvg;
                if (priceText.includes('-') || priceText.includes('/')) {
                    const separator = priceText.includes('-') ? '-' : '/';
                    const parts = priceText.split(separator);
                    priceMin = parseFloat(parts[0]);
                    priceMax = parseFloat(parts[1]);
                    priceAvg = (priceMin + priceMax) / 2;
                } else {
                    priceAvg = parseFloat(priceText);
                }
                
                if (!isNaN(priceAvg) && priceAvg > 0) {
                    prices.push({
                        date,
                        species: 'bovino',
                        segment: currentSegment,
                        category_name: categoryName,
                        normalized_category: TalaveraParser.normalizeCategory(categoryName),
                        price_avg: priceAvg,
                        price_min: priceMin,
                        price_max: priceMax,
                        unit: currentUnit,
                        trend: 'unknown' as TrendType
                    });
                }
            });
            
            return {
                prices,
                rawContent: html,
                contentType: 'text/html'
            };
            
        } catch (error) {
            console.error('TalaveraParser error:', error);
            throw error;
        }
    }
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        if (lower.includes('pastero')) return 'terneros_pasteros';
        if (lower.includes('vaca')) return 'vacas_matadero';
        if (lower.includes('añojo')) return 'añojos';
        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }
}
