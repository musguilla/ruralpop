import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';
import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SieroParser {
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // 1. Fetch Siero Market Page
        const response = await fetch(source.source_url);
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
                const pdfRes = await fetch(absoluteUrl);
                if (!pdfRes.ok) continue;
                
                const arrayBuffer = await pdfRes.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);
                
                // Extract text
                const parser = new PDFParse(buffer);
                const text = await parser.getText();
                rawContentMerged += `\n\n--- PDF: ${link.url} ---\n${text}`;
                
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
                const lines = text.split('\n');
                
                for (const line of lines) {
                    // Try to match lines with numbers at the end
                    // e.g., "Vacas extra 4,50 5,50" or "Terneros pintos 200 €"
                    const priceMatch = line.match(/(.+?)\s+([\d,.]+)(?:\s*€|\s+([\d,.]+))?$/);
                    
                    if (priceMatch) {
                        const rawCategory = priceMatch[1].trim();
                        if (rawCategory.length < 4 || rawCategory.toLowerCase().includes('precio')) continue; // skip noise
                        
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
                        
                        let segment: SegmentType = 'vida';
                        let unit: UnitType = 'eur_unidad';
                        
                        if (link.type === 'abasto') {
                            segment = 'abasto';
                            unit = 'eur_kg_canal';
                        } else if (link.type === 'recría') {
                            segment = 'recría';
                            unit = 'eur_unidad';
                        }
                        
                        prices.push({
                            date,
                            species: 'bovino',
                            segment,
                            category_name: rawCategory,
                            normalized_category: SieroParser.normalizeCategory(rawCategory),
                            price_min: priceMin || undefined,
                            price_max: priceMax || undefined,
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
        if (lower.includes('vaca') && lower.includes('extra')) return 'vacas_extra';
        if (lower.includes('vaca') && lower.includes('primera')) return 'vacas_primera';
        if (lower.includes('vaca') && lower.includes('segunda')) return 'vacas_segunda';
        if (lower.includes('vaca') && lower.includes('industrial')) return 'vacas_industria';
        if (lower.includes('terner') && lower.includes('cruzado')) return 'terneros_cruzados';
        if (lower.includes('terner') && lower.includes('pinto')) return 'terneros_frisones';
        
        return 'sin_normalizar_' + lower.replace(/[^a-z0-9]/g, '_').substring(0, 30);
    }
}
