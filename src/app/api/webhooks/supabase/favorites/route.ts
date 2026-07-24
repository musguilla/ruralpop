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

        // Fetch the listing to get the owner and title
        const { data: listing, error: listingError } = await supabaseAdmin
            .from('listings')
            .select('user_id, title')
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

        // Notify the listing owner
        await sendNotification({
            userId: listing.user_id,
            type: 'favorite',
            title: '¡A alguien le gusta tu artículo!',
            body: `Tu artículo "${listing.title}" ha sido añadido a favoritos. ¡Podría venderse pronto!`,
            data: { url: `/anuncio/${listing_id}` }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing favorite webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
