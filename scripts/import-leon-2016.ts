import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { LeonParser } from '../src/lib/services/etl/parsers/LeonParser';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const MARKET_ID = '4d12ab5e-b2d9-4f76-92c1-d9a24c58df12';

function extractDateFromUrl(url: string): Date | null {
    const match = url.match(/-(\d{2})-(\d{2})-(\d{4})\/?$/);
    if (match) {
        return new Date(`${match[3]}-${match[2]}-${match[1]}T12:00:00Z`);
    }
    return null;
}

async function fetchPageLinks(page: number): Promise<string[]> {
    const url = `https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/page/${page}/`;
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const html = await response.text();
        
        const links: string[] = [];
        // Match any link that looks like a lonja vacuno date link
        const regex = /href="(https:\/\/www\.lonjadeleon\.es\/lonja-[^"]*vacuno[^"]*-\d{2}-\d{2}-\d{4}\/?)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            links.push(match[1]);
        }
        return links;
    } catch (e) {
        return [];
    }
}

async function main() {
    console.log("Fetching all pagination links...");
    let allLinks: string[] = [];
    
    // Pages 1 to 28
    for (let i = 1; i <= 28; i++) {
        console.log(`Scanning page ${i}...`);
        const links = await fetchPageLinks(i);
        allLinks.push(...links);
        await new Promise(r => setTimeout(r, 200)); // be nice
    }
    
    // Deduplicate and remove `#respond` etc
    const uniqueLinks = [...new Set(allLinks.map(l => l.replace(/#.*$/, '')))];
    console.log(`Found ${uniqueLinks.length} unique historical records to process.`);

    for (const url of uniqueLinks) {
        const date = extractDateFromUrl(url);
        if (!date) continue;
        
        // Skip dates >= 2024-10-02 since we already have them?
        // Let's just process them all anyway, upsert handles it.
        const dateStr = date.toISOString().split('T')[0];
        
        console.log(`Processing ${dateStr} from ${url}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) continue;
            const html = await response.text();
            
            const source = {
                id: MARKET_ID,
                name: 'Lonja Agropecuaria de León',
                source_url: url,
                source_type: 'html' as const,
                active: true
            };

            const result = await LeonParser.parse(source, html, url, date);
            const pricesWithDate = result.prices.map(p => ({
                ...p,
                date: dateStr,
                market_source_id: MARKET_ID
            }));

            if (pricesWithDate.length > 0) {
                const { error } = await supabase
                    .from('livestock_prices')
                    .upsert(pricesWithDate, { 
                        onConflict: 'market_source_id, date, category_name, unit',
                        ignoreDuplicates: false 
                    });

                if (error) {
                    console.error(`Error saving ${dateStr}:`, error);
                } else {
                    console.log(`✅ Saved ${pricesWithDate.length} prices for ${dateStr}`);
                }
            } else {
                console.log(`⚠️ No prices extracted for ${dateStr}`);
            }

        } catch (error) {
            console.error(`Error processing ${dateStr}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

main();
