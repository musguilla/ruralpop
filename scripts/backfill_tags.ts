import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PREDEFINED_TAGS } from './src/constants/predefinedTags';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Normalize text for matching
const normalize = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

async function backfillTags() {
    console.log('Fetching active listings with no tags...');
    
    let allListings: any[] = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
        const { data, error } = await supabase
            .from('listings')
            .select('id, title, description, category, subcategory, tags')
            .eq('status', 'active')
            .range(page * pageSize, (page + 1) * pageSize - 1);
            
        if (error) {
            console.error('Error fetching listings:', error);
            return;
        }
        
        if (!data || data.length === 0) break;
        
        allListings = [...allListings, ...data];
        page++;
    }
    
    // Filter listings that have no tags
    const listingsToTag = allListings.filter(l => !l.tags || l.tags.length === 0);
    
    console.log(`Found ${allListings.length} total active listings.`);
    console.log(`Found ${listingsToTag.length} active listings that need tags.`);
    
    if (listingsToTag.length === 0) {
        console.log('Nothing to do!');
        return;
    }
    
    let updatedCount = 0;
    let untaggableCount = 0;
    
    for (const listing of listingsToTag) {
        const titleText = normalize(listing.title || '');
        const descText = normalize(listing.description || '');
        const fullText = `${titleText} ${descText}`;
        
        // Find matching tags
        const matchedTags: string[] = [];
        
        // Strategy: First look in the specific subcategory tags (if possible), 
        // then across all if needed. But string matching across all is fine.
        for (const [groupName, tags] of Object.entries(PREDEFINED_TAGS)) {
            for (const tag of tags) {
                const normalizedTag = normalize(tag);
                
                // If the tag is exactly in the text, or if it's a single word and matches word boundaries
                // To prevent partial matches like "paja" matching "pájaro", we use regex word boundaries
                const regex = new RegExp(`\\b${normalizedTag}\\b`, 'i');
                if (regex.test(fullText)) {
                    if (!matchedTags.includes(tag)) {
                        matchedTags.push(tag);
                    }
                }
            }
        }
        
        if (matchedTags.length > 0) {
            // Take up to 2 tags randomly or just the first two found
            const selectedTags = matchedTags.slice(0, 2);
            
            console.log(`[${listing.id}] "${listing.title}" => found tags: ${selectedTags.join(', ')}`);
            
            const { error: updateError } = await supabase
                .from('listings')
                .update({ tags: selectedTags })
                .eq('id', listing.id);
                
            if (updateError) {
                console.error(`Failed to update listing ${listing.id}:`, updateError);
            } else {
                updatedCount++;
            }
        } else {
            untaggableCount++;
            console.log(`[${listing.id}] "${listing.title}" => no tags matched.`);
        }
    }
    
    console.log(`\nDONE. Successfully updated ${updatedCount} listings. ${untaggableCount} listings could not be matched with any predefined tags.`);
}

backfillTags();
