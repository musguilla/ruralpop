import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SantiagoParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // 1. Fetch Santiago Market Page
        const response = await fetch(source.source_url);
        if (!response.ok) {
            throw new Error(`Santiago API returned ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const prices: Omit<ETLParserResult['prices'][0], 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[] = [];
        let rawContentMerged = '';
        
        // 2. Find links to PDFs. Santiago lists them directly on the page
        const pdfLinks: string[] = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.endsWith('.pdf') && href.toLowerCase().includes('cotizaci')) {
                pdfLinks.push(href);
            }
        });
        
        if (pdfLinks.length === 0) {
            throw new Error('Santiago API: No PDF links found');
        }
        
        // Process only the first (latest) PDF
        const latestPdfUrl = pdfLinks[0].startsWith('http') ? pdfLinks[0] : `https://santiagodecompostela.gal${pdfLinks[0]}`;
        
        const pdfRes = await fetch(latestPdfUrl);
        if (!pdfRes.ok) {
            throw new Error(`Santiago API returned ${pdfRes.status} for PDF`);
        }
        
        const arrayBuffer = await pdfRes.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        // Extract text
        const parser = new PDFParse(buffer);
        const text = await parser.getText();
        rawContentMerged = text;
        
        // Extract Date from URL
        // Example: Cotizacións%2C%2022.04.2026_0.pdf
        const dateMatch = latestPdfUrl.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        let date = new Date();
        if (dateMatch) {
            const [, d, m, y] = dateMatch;
            date = new Date(`${y}-${m}-${d}T12:00:00Z`);
        }
        
        // Basic Line Parsing
        const lines = text.split('\n');
        let currentSegment: SegmentType = 'abasto';
        let currentUnit: UnitType = 'eur_kg_canal';
        
        for (const line of lines) {
            const upperLine = line.toUpperCase();
            
            // Detect segment headers
            if (upperLine.includes('RECRÍA') || upperLine.includes('PINTO')) {
                currentSegment = 'recría';
                currentUnit = 'eur_unidad';
            } else if (upperLine.includes('ABASTO') || upperLine.includes('CANAL')) {
                currentSegment = 'abasto';
                currentUnit = 'eur_kg_canal';
            }
            
            // Try to match lines with numbers at the end
            const priceMatch = line.match(/(.+?)\s+([\d,.]+)(?:\s*€|\s+([\d,.]+))?$/);
            
            if (priceMatch) {
                const rawCategory = priceMatch[1].trim();
                if (rawCategory.length < 4 || rawCategory.toLowerCase().includes('precio')) continue; 
                
                let priceAvg = 0, priceMin = 0, priceMax = 0;
                const val1Str = priceMatch[2].replace(',', '.');
                const val1 = parseFloat(val1Str);
                
                if (priceMatch[3]) {
                    const val2Str = priceMatch[3].replace(',', '.');
                    const val2 = parseFloat(val2Str);
                    priceMin = Math.min(val1, val2);
                    priceMax = Math.max(val1, val2);
                    priceAvg = (priceMin + priceMax) / 2;
                } else {
                    priceAvg = val1;
                }
                
                if (isNaN(priceAvg) || priceAvg <= 0) continue;
                
                prices.push({
                    date,
                    species: 'bovino',
                    segment: currentSegment,
                    category_name: rawCategory,
                    normalized_category: SantiagoParser.normalizeCategory(rawCategory),
                    price_min: priceMin || undefined,
                    price_max: priceMax || undefined,
                    price_avg: priceAvg,
                    unit: currentUnit,
                    trend: 'unknown' as TrendType
                });
            }
        }
        
        return {
            prices,
            rawContent: rawContentMerged,
            contentType: 'text/plain'
        };
    }
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        if (lower.includes('pinto')) return 'terneros_frisones';
        if (lower.includes('cruce') || lower.includes('cruzado')) return 'terneros_cruzados';
        if (lower.includes('rubia')) return 'terneros_rubia_gallega';
        if (lower.includes('vaca')) return 'vacas_matadero';
        
        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }
}
