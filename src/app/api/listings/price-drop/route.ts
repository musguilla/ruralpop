import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyPriceDrop } from '@/lib/services/notifications';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { listingId, oldPrice, newPrice } = body;

        if (!listingId || typeof oldPrice !== 'number' || typeof newPrice !== 'number') {
            return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
        }

        if (newPrice >= oldPrice) {
            return NextResponse.json({ message: 'No price drop detected' });
        }

        // Fetch listing data
        const { data: listing, error: listingError } = await supabaseAdmin
            .from('listings')
            .select('title, image_urls, user_id')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const result = await notifyPriceDrop({
            listingId,
            oldPrice,
            newPrice,
            listingTitle: listing.title,
            imageUrl: Array.isArray(listing.image_urls) && listing.image_urls.length > 0 ? listing.image_urls[0] : null,
            sellerId: listing.user_id,
        });

        return NextResponse.json({ success: true, result });
    } catch (err: unknown) {
        console.error('Error in price-drop endpoint:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
