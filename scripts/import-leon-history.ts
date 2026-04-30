import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { LeonParser } from '../src/lib/services/etl/parsers/LeonParser';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const MARKET_ID = '9c3d87fa-21d7-4f6c-b364-e4c13a2948c3'; // We need to verify or create this ID

const urls = [
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-15-04-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-01-04-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-18-03-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-04-03-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-18-02-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-04-02-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-21-01-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-07-01-2026/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-23-12-2025/',
    'https://www.lonjadeleon.es/lonja-carne-vacuno-10-12-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-26-11-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-12-11-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-29-10-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-15-10-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-01-10-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-17-09-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-03-09-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-20-08-2025/',
    'https://www.lonjadeleon.es/lonja-carne-de-vacuno-06-08-2025/'
];

function extractDateFromUrl(url: string): Date | null {
    const match = url.match(/-(\d{2})-(\d{2})-(\d{4})\/?$/);
    if (match) {
        return new Date(`${match[3]}-${match[2]}-${match[1]}T12:00:00Z`);
    }
    return null;
}

async function run() {
    console.log('Fetching market ID for Leon...');
    const { data: marketData, error: marketError } = await supabase
        .from('market_sources')
        .select('id')
        .ilike('name', '%León%')
        .single();
        
    let marketId = marketData?.id;
    
    if (!marketId) {
        console.log('Leon market not found. Creating it...');
        const { data: newMarket, error: createError } = await supabase
            .from('market_sources')
            .insert({
                name: 'Lonja Agropecuaria de León',
                url: 'https://www.lonjadeleon.es/',
                status: 'active',
                frequency: 'weekly'
            })
            .select()
            .single();
            
        if (createError) {
            console.error('Failed to create market:', createError);
            return;
        }
        marketId = newMarket.id;
    }
    
    console.log(`Using Market ID: ${marketId}`);

    for (const url of urls) {
        console.log(`Processing ${url}...`);
        try {
            const date = extractDateFromUrl(url);
            if (!date) {
                console.error(`Could not extract date from ${url}`);
                continue;
            }

            const response = await fetch(url);
            if (!response.ok) {
                console.error(`HTTP error ${response.status} fetching ${url}`);
                continue;
            }

            const html = await response.text();
            const result = await LeonParser.parseHtml(html, date, url);
            
            if (result.prices.length === 0) {
                console.warn(`No prices found for ${url}`);
                continue;
            }

            // Insert into Supabase
            const { error: insertError } = await supabase
                .from('livestock_prices')
                .insert(result.prices.map(p => ({
                    ...p,
                    market_source_id: marketId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })));

            if (insertError) {
                console.error(`Error inserting prices for ${url}:`, insertError);
            } else {
                console.log(`Inserted ${result.prices.length} prices for ${date.toISOString().split('T')[0]}`);
            }

            // Add slight delay to avoid rate limits
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }
    console.log('Finished processing all URLs.');
}

run();
