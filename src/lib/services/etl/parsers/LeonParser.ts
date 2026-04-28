import * as cheerio from 'cheerio';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class LeonParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // 1. Fetch the category page to find the latest post URL
        const categoryUrl = 'https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/';
        const catResponse = await fetch(categoryUrl);
        if (!catResponse.ok) {
            throw new Error(`Leon API returned ${catResponse.status} on category`);
        }
        
        const catHtml = await catResponse.text();
        const $cat = cheerio.load(catHtml);
        
        // Find the first post URL
        const latestPostUrl = $cat('.entry_title a').first().attr('href');
        if (!latestPostUrl) {
            throw new Error('Leon API: Could not find latest post URL');
        }
        
        // 2. Fetch the actual post
        const postResponse = await fetch(latestPostUrl);
        if (!postResponse.ok) {
            throw new Error(`Leon API returned ${postResponse.status} on post ${latestPostUrl}`);
        }
        
        const postHtml = await postResponse.text();
        const $ = cheerio.load(postHtml);
        
        // 3. Extract the date from the title (e.g., "Lonja carne de vacuno 15-04-2026")
        const titleText = $('.entry_title').text().trim();
        const dateMatch = titleText.match(/(\d{2})-(\d{2})-(\d{4})/);
        let date = new Date();
        if (dateMatch) {
            const [, day, month, year] = dateMatch;
            date = new Date(`${year}-${month}-${day}T12:00:00Z`);
        } else {
            // fallback to published date
            const timeText = $('.entry_date.updated').text(); // "15 Abr"
            // Let's rely on dateMatch if possible, otherwise use new Date() and log it
            console.warn("LeonParser: Could not parse exact date from title, using current date");
        }
        
        const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
        
        // 4. Parse the table
        const rows = $('table tr');
        let currentSegment: SegmentType = 'abasto';
        let currentUnit: UnitType = 'eur_kg_vivo';
        
        rows.each((i, row) => {
            const cells = $(row).find('td, th');
            if (cells.length === 0) return;
            
            const firstCell = $(cells[0]).text().trim();
            const upperFirst = firstCell.toUpperCase();
            
            // Detect segment headers
            if (upperFirst.includes('GANADO VIDA')) {
                currentSegment = 'vida';
                currentUnit = 'eur_unidad';
                return;
            }
            if (upperFirst.includes('BOVINO CARNE')) {
                currentSegment = 'carne';
                currentUnit = 'eur_kg_canal';
                return;
            }
            if (upperFirst.includes('VACAS SACRIFICIO')) {
                currentSegment = 'abasto';
                currentUnit = 'eur_kg_canal';
                return;
            }
            
            // Skip headers
            if (upperFirst === 'VACUNO' || upperFirst.includes('COTIZACION')) return;
            
            // Expected format: [Categoria, Precio Anterior, Precio Actual, Dif]
            // Sometimes categories span multiple columns or have 'U', 'R', 'O'
            if (cells.length >= 3) {
                let categoryName = firstCell;
                let priceText = $(cells[2]).text().trim();
                
                // If it's a sub-row like U, R, O, the category is preceding row + U/R/O
                if (firstCell === 'U' || firstCell === 'R' || firstCell === 'O') {
                    // It's a conformation class. We need to find the parent category
                    // For simplicity, we just use the firstCell as part of the category
                    categoryName = `Clase ${firstCell}`;
                    // Try to peek previous rows to get the main category...
                    // A better way is tracking the last main category
                }
                
                // Track last main category for sub-rows
                const classMatch = firstCell.match(/^[URO]$/);
                if (classMatch) {
                    categoryName = `${LeonParser.lastMainCategory} - Clase ${firstCell}`;
                } else if (firstCell) {
                    LeonParser.lastMainCategory = firstCell;
                }
                
                priceText = priceText.replace(',', '.');
                
                // Handle ranges like "4,40/5,40"
                let priceMin, priceMax, priceAvg;
                if (priceText.includes('/')) {
                    const parts = priceText.split('/');
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
                        normalized_category: LeonParser.normalizeCategory(categoryName),
                        price_avg: priceAvg,
                        price_min: priceMin,
                        price_max: priceMax,
                        unit: currentUnit,
                        trend: 'unknown' as TrendType
                    });
                }
            }
        });
        
        return {
            prices,
            rawContent: postHtml,
            contentType: 'text/html'
        };
    }
    
    static lastMainCategory = '';
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        if (lower.includes('pastero')) return lower.includes('hembra') ? 'terneros_pasteros_hembras' : 'terneros_pasteros_machos';
        if (lower.includes('frisones')) return 'terneros_frisones';
        if (lower.includes('hembras 180-200')) return 'terneras_180_200';
        if (lower.includes('hembras 201-250')) return 'terneras_201_250';
        if (lower.includes('machos 200-250')) return 'añojos_200_250';
        if (lower.includes('fábrica') || lower.includes('segunda')) return 'vacas_industria';
        if (lower.includes('primera') || lower.includes('extra')) return 'vacas_extra';
        
        return lower.replace(/[^a-z0-9]/g, '_');
    }
}
