import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        if (payload.table !== 'listings') {
            return NextResponse.json({ message: 'Ignored non-listings table' });
        }

        // ====================================================================
        // CASO 1: UPDATE -> DETECCIÓN DE BAJADA DE PRECIO
        // ====================================================================
        if (payload.type === 'UPDATE') {
            const oldRecord = payload.old_record;
            const newRecord = payload.record;

            const oldPrice = Number(oldRecord?.price);
            const newPrice = Number(newRecord?.price);

            if (oldPrice > 0 && newPrice > 0 && newPrice < oldPrice) {
                const { notifyPriceDrop } = await import('@/lib/services/notifications');
                const result = await notifyPriceDrop({
                    listingId: newRecord.id,
                    oldPrice,
                    newPrice,
                    listingTitle: newRecord.title,
                    imageUrl: Array.isArray(newRecord.image_urls) && newRecord.image_urls.length > 0
                        ? newRecord.image_urls[0]
                        : null,
                    sellerId: newRecord.user_id,
                });

                return NextResponse.json({ success: true, priceDrop: result });
            }

            return NextResponse.json({ message: 'Ignored update without price drop' });
        }

        // ====================================================================
        // CASO 2: INSERT -> NUEVO ANUNCIO DE VENDEDOR SEGUIDO
        // ====================================================================
        if (payload.type !== 'INSERT') {
            return NextResponse.json({ message: 'Ignored' });
        }

        const listing = payload.record;
        
        // Skip if not active
        if (listing.status !== 'active') {
            return NextResponse.json({ message: 'Ignored inactive listing' });
        }

        // 1. Get the seller's details
        const { data: seller, error: sellerError } = await supabaseAdmin
            .from('users')
            .select('name, commercial_name')
            .eq('id', listing.user_id)
            .single();

        if (sellerError || !seller) {
            return new NextResponse('Seller not found', { status: 404 });
        }
        
        const sellerName = seller.commercial_name || seller.name || 'Un usuario';

        // 2. Count listings by this seller in the last 15 minutes
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabaseAdmin
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', listing.user_id)
            .eq('status', 'active')
            .gte('created_at', fifteenMinsAgo);

        const newListingsCount = count || 1;

        // 3. Find all followers
        const { data: followers, error: followersError } = await supabaseAdmin
            .from('favorite_profiles')
            .select('follower_id')
            .eq('profile_id', listing.user_id);

        if (followersError || !followers || followers.length === 0) {
            return NextResponse.json({ message: 'No followers to notify' });
        }

        // 4. Send notifications
        // We import dynamically to avoid edge runtime issues if notifications uses node modules
        const { sendNotification } = await import('@/lib/services/notifications');
        
        let title = '';
        let body = '';
        
        const imageUrl = Array.isArray(listing.image_urls) && listing.image_urls.length > 0
            ? listing.image_urls[0]
            : null;

        if (newListingsCount === 1) {
            title = `✨ ¡Nuevo anuncio de ${sellerName}!`;
            body = `${sellerName} acaba de publicar «${listing.title}». ¡Míralo antes de que vuele!`;
        } else {
            title = `✨ ¡Nuevos anuncios de ${sellerName}!`;
            body = `${sellerName} ha subido ${newListingsCount} productos nuevos. ¡Míralos antes de que vuelen!`;
        }

        const notificationsPromises = followers.map(f => 
            sendNotification({
                userId: f.follower_id,
                type: 'new_listing',
                title,
                body,
                data: {
                    url: `/anuncio/${listing.id}`,
                    listing_id: listing.id,
                    listing_title: listing.title,
                    image_url: imageUrl,
                }
            })
        );

        await Promise.all(notificationsPromises);

        return NextResponse.json({ success: true, notified: followers.length });
    } catch (error) {
        console.error('Error processing listings webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
