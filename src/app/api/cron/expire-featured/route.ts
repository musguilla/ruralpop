import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyFeaturedExpiringSoon, notifyFeaturedExpired } from "@/lib/services/notifications";

export async function GET(req: Request) {
    // Basic security check: verify Authorization header
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // We need the service role key to bypass RLS and perform bulk updates
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const nowTime = new Date();
        const nowIso = nowTime.toISOString();

        // ====================================================================
        // 1. AVISO 1 DÍA ANTES DE CADUCAR EL DESTACADO
        // Regla: Se notifica únicamente si el anuncio ha recibido > 3 me gusta
        // ====================================================================
        const minExpiringTime = new Date(nowTime.getTime() + 12 * 60 * 60 * 1000).toISOString();
        const maxExpiringTime = new Date(nowTime.getTime() + 36 * 60 * 60 * 1000).toISOString();

        const { data: expiringSoonListings, error: expiringSoonError } = await supabaseAdmin
            .from('listings')
            .select('id, user_id, title, image_urls, featured_until')
            .eq('is_featured', true)
            .gte('featured_until', minExpiringTime)
            .lte('featured_until', maxExpiringTime);

        let expiringSoonNotified = 0;
        let expiringSoonSkipped = 0;

        if (expiringSoonError) {
            console.error('Error fetching expiring soon featured listings:', expiringSoonError);
        } else if (expiringSoonListings && expiringSoonListings.length > 0) {
            const twoDaysAgo = new Date(nowTime.getTime() - 48 * 60 * 60 * 1000).toISOString();

            for (const listing of expiringSoonListings) {
                try {
                    // Prevenir duplicidades si el cron se ejecuta varias veces
                    const { count: alreadyNotified } = await supabaseAdmin
                        .from('notifications')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', listing.user_id)
                        .eq('type', 'featured_expiring_soon')
                        .filter('data->>listing_id', 'eq', listing.id)
                        .gte('created_at', twoDaysAgo);

                    if (alreadyNotified && alreadyNotified > 0) {
                        continue;
                    }

                    // Consultar número de me gusta acumulados
                    const { count: favCount } = await supabaseAdmin
                        .from('favorites')
                        .select('id', { count: 'exact', head: true })
                        .eq('listing_id', listing.id);

                    const likes = favCount || 0;

                    // Solo avisar si son estrictamente mayores a 3 (si son <= 3 se omite el aviso)
                    if (likes > 3) {
                        await notifyFeaturedExpiringSoon({
                            listingId: listing.id,
                            userId: listing.user_id,
                            listingTitle: listing.title,
                            imageUrl: Array.isArray(listing.image_urls) && listing.image_urls.length > 0
                                ? listing.image_urls[0]
                                : null,
                            favoritesCount: likes,
                        });
                        expiringSoonNotified++;
                    } else {
                        expiringSoonSkipped++;
                    }
                } catch (listingNotifErr) {
                    console.error(`Error notifying listing expiring soon ${listing.id}:`, listingNotifErr);
                }
            }
        }

        // ====================================================================
        // 2. AVISO EL DÍA QUE CADUCA EL DESTACADO (Animar a renovar)
        // Desactiva el flag de destacado y avisa inmediatamente al vendedor
        // ====================================================================
        const { data: expiredListings, error: expireError } = await supabaseAdmin
            .from('listings')
            .update({
                is_featured: false,
                featured_until: null
            })
            .eq('is_featured', true)
            .lt('featured_until', nowIso)
            .select('id, user_id, title, image_urls');

        if (expireError) {
            console.error('Error expiring featured listings:', expireError);
            return new NextResponse(`Error: ${expireError.message}`, { status: 500 });
        }

        let expiredNotified = 0;

        if (expiredListings && expiredListings.length > 0) {
            for (const listing of expiredListings) {
                try {
                    await notifyFeaturedExpired({
                        listingId: listing.id,
                        userId: listing.user_id,
                        listingTitle: listing.title,
                        imageUrl: Array.isArray(listing.image_urls) && listing.image_urls.length > 0
                            ? listing.image_urls[0]
                            : null,
                    });
                    expiredNotified++;
                } catch (expiredNotifErr) {
                    console.error(`Error notifying expired featured listing ${listing.id}:`, expiredNotifErr);
                }
            }
        }

        console.log(
            `Cron execution complete. Expired ${expiredListings?.length || 0} listings (${expiredNotified} notified). Expiring soon: ${expiringSoonNotified} notified, ${expiringSoonSkipped} skipped (<=3 likes).`
        );

        return NextResponse.json({
            success: true,
            expiredCount: expiredListings?.length || 0,
            expiredNotified,
            expiringSoonNotified,
            expiringSoonSkipped,
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown exception';
        console.error('Cron job exception:', err);
        return new NextResponse(`Exception: ${message}`, { status: 500 });
    }
}
