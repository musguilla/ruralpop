import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/services/notifications';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Ensure this is an INSERT event
        if (payload.type !== 'INSERT' || payload.table !== 'favorites') {
            return NextResponse.json({ message: 'Ignored' });
        }

        const { listing_id, user_id: liker_id } = payload.record;

        // Fetch the listing to get the owner, title and images
        const { data: listing, error: listingError } = await supabaseAdmin
            .from('listings')
            .select('user_id, title, image_urls')
            .eq('id', listing_id)
            .single();

        if (listingError || !listing) {
            console.error('Failed to find listing for favorite webhook', listingError);
            return new NextResponse('Listing not found', { status: 404 });
        }

        // Don't notify if the user favorites their own listing
        if (listing.user_id === liker_id) {
            return NextResponse.json({ message: 'Ignored self-favorite' });
        }

        const imageUrl = Array.isArray(listing.image_urls) && listing.image_urls.length > 0
            ? listing.image_urls[0]
            : null;

        // Notify the listing owner with Wallapop text, star emoji, and product image
        await sendNotification({
            userId: listing.user_id,
            type: 'favorite',
            title: '⭐ Tienes un nuevo favorito',
            body: `¡"${listing.title}" está gustando!`,
            data: {
                url: `/anuncio/${listing_id}`,
                listing_id,
                listing_title: listing.title,
                image_url: imageUrl,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing favorite webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
