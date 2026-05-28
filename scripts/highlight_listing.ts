import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { decodeId } from '../src/utils/idUtils';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function highlightListing(slug: string) {
    const slugParts = slug.split('-');
    const shortId = slugParts.pop() || '';
    const id = decodeId(shortId);

    if (!id) {
        console.error("Invalid shortId or couldn't decode.");
        process.exit(1);
    }

    console.log(`Original UUID: ${id}`);

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30); // Feature for 30 days

    const { data, error } = await supabase
        .from('listings')
        .update({ 
            is_featured: true, 
            featured_until: featuredUntil.toISOString() 
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating listing:', error);
    } else {
        console.log('Listing successfully highlighted:', data);
    }
}

const targetSlug = process.argv[2] || "anuncio-4Z3vGiukDWniTfZKk7yKnX";
highlightListing(targetSlug);
