import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SalamancaParser } from '../src/lib/services/etl/parsers/SalamancaParser';
import { MarketSource } from '../src/types/livestock';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const MARKET_ID = '3e25b6a7-d8c9-4b12-9c3f-9e7f8d9b1a2c'; // Replace with real Salamanca ID if different

async function main() {
    console.log("Fetching Salamanca FULL historical data...");
    
    // 1. First get the real market ID from the DB
    const { data: marketData, error: marketError } = await supabase
        .from('market_sources')
        .select('id, name, source_url')
        .ilike('name', '%salamanca%')
        .single();
        
    let marketId = MARKET_ID;
    let sourceUrl = "https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca";

    if (marketData) {
        console.log(`Found Salamanca Market ID: ${marketData.id}`);
        marketId = marketData.id;
        sourceUrl = marketData.source_url;
    } else {
        console.warn("Could not find Salamanca in DB. Proceeding with fallback ID.");
    }

    const source: MarketSource = {
        id: marketId,
        name: 'Lonja de Salamanca',
        source_url: sourceUrl,
        source_type: 'html', // Doesn't matter
        active: true
    };

    // 2. Parse using -1 limit (unlimited)
    console.log("Parsing all rows (this might take a moment to download and process 122k lines)...");
    const result = await SalamancaParser.parse(source, -1);
    
    console.log(`Total prices extracted: ${result.prices.length}`);
    
    // 3. Batch UPSERT in chunks of 5000
    const CHUNK_SIZE = 5000;
    
    // Attach market_source_id and convert dates to YYYY-MM-DD
    const allPrices = result.prices.map(p => {
        const dateStr = p.date.toISOString().split('T')[0];
        return {
            ...p,
            date: dateStr,
            market_source_id: marketId
        };
    });
    
    for (let i = 0; i < allPrices.length; i += CHUNK_SIZE) {
        const chunk = allPrices.slice(i, i + CHUNK_SIZE);
        console.log(`Upserting chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(allPrices.length / CHUNK_SIZE)}...`);
        
        const { error } = await supabase
            .from('livestock_prices')
            .upsert(chunk, { 
                onConflict: 'market_source_id, date, category_name, unit',
                ignoreDuplicates: false 
            });

        if (error) {
            console.error(`Error saving chunk starting at index ${i}:`, error);
        } else {
            console.log(`✅ Saved chunk of ${chunk.length} prices`);
        }
    }
    
    console.log("Done uploading Salamanca historical data.");
}

main();
