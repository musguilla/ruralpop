import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { LeonParser } from '../src/lib/services/etl/parsers/LeonParser';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const MARKET_ID = '4d12ab5e-b2d9-4f76-92c1-d9a24c58df12';

const urls = [
  "https://www.lonjadeleon.es/lonja-carne-vacuno-05-08-2026/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-23-07-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-09-07-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-25-06-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-11-06-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-28-05-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-14-05-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-30-04-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-16-04-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-02-04-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-19-02-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-05-02-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-22-01-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-08-01-2025/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-11-12-2024/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-27-11-2024/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-13-11-2024/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-30-10-2024/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-16-10-2024/",
  "https://www.lonjadeleon.es/lonja-carne-de-vacuno-02-10-2024/",
  "https://www.lonjadeleon.es/lonja-carne-vacuno-26-12-2024/"
];

function extractDateFromUrl(url: string): Date | null {
    const match = url.match(/-(\d{2})-(\d{2})-(\d{4})\/?$/);
    if (match) {
        return new Date(`${match[3]}-${match[2]}-${match[1]}T12:00:00Z`);
    }
    return null;
}

async function main() {
    for (const url of urls) {
        const date = extractDateFromUrl(url);
        if (!date) {
            console.warn(`Could not extract date from ${url}`);
            continue;
        }

        console.log(`Processing ${url} for date ${date.toISOString()}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch ${url}: ${response.statusText}`);
                continue;
            }
            
            const html = await response.text();
            const source = {
                id: MARKET_ID,
                name: 'Lonja Agropecuaria de León',
                source_url: url,
                source_type: 'html' as const,
                active: true
            };

            const result = await LeonParser.parse(source, html);
            
            const dateStr = date.toISOString().split('T')[0];
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
                    console.error(`Error saving prices for ${url}:`, error);
                } else {
                    console.log(`✅ Saved ${pricesWithDate.length} prices for ${dateStr}`);
                }
            } else {
                console.warn(`⚠️ No prices extracted for ${url}`);
            }

        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

main();
