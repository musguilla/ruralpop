import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SalamancaParser } from '../src/lib/services/etl/parsers/SalamancaParser';
import { MarketSource } from '../src/types/livestock';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const MARKET_ID = '3e25b6a7-d8c9-4b12-9c3f-9e7f8d9b1a2c';

async function main() {
    console.log("Fetching Salamanca FULL historical data (with deduplication)...");
    
    const { data: marketData } = await supabase
        .from('market_sources')
        .select('id, name, source_url')
        .ilike('name', '%salamanca%')
        .single();
        
    let marketId = MARKET_ID;
    let sourceUrl = "https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca";

    if (marketData) {
        marketId = marketData.id;
        sourceUrl = marketData.source_url;
    }

    const source: MarketSource = {
        id: marketId,
        name: 'Lonja de Salamanca',
        source_url: sourceUrl,
        source_type: 'html',
        active: true
    };

    const result = await SalamancaParser.parse(source, -1);
    
    const CHUNK_SIZE = 5000;
    
    const allPrices = result.prices.map(p => {
        const dateStr = p.date.toISOString().split('T')[0];
        return {
            ...p,
            date: dateStr,
            market_source_id: marketId
        };
    });
    
    // DEDUPLICATE by unique constraint
    const uniqueMap = new Map();
    for (const p of allPrices) {
        const key = `${p.market_source_id}_${p.date}_${p.category_name}_${p.unit}`;
        uniqueMap.set(key, p); // will keep the latest if duplicates exist
    }
    const uniquePrices = Array.from(uniqueMap.values());
    console.log(`Unique prices after deduplication: ${uniquePrices.length} (original: ${allPrices.length})`);
    
    for (let i = 0; i < uniquePrices.length; i += CHUNK_SIZE) {
        const chunk = uniquePrices.slice(i, i + CHUNK_SIZE);
        console.log(`Upserting chunk ${Math.floor(i / CHUNK_SIZE) + 1}...`);
        
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
}

main();
