import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Ensure this is an INSERT event
        if (payload.type !== 'INSERT' || payload.table !== 'listings') {
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
        
        if (newListingsCount === 1) {
            title = '¡Nuevo anuncio de ' + sellerName + '!';
            body = `${sellerName} acaba de subir «${listing.title}». ¡Míralo antes de que vuele!`;
        } else {
            title = '¡Nuevos anuncios de ' + sellerName + '!';
            body = `${sellerName} ha subido ${newListingsCount} productos nuevos. ¡Míralo antes de que vuele!`;
        }

        const notificationsPromises = followers.map(f => 
            sendNotification({
                userId: f.follower_id,
                type: 'new_listing',
                title,
                body,
                data: { url: `/user/${listing.user_id}` }
            })
        );

        await Promise.all(notificationsPromises);

        return NextResponse.json({ success: true, notified: followers.length });
    } catch (error) {
        console.error('Error processing listings webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
