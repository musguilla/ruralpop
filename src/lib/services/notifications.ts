import { createClient } from "@supabase/supabase-js";

// Initialize admin client to bypass RLS for inserting notifications and fetching push tokens
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type NotificationType =
    | 'sale'
    | 'shipped'
    | 'receipt_confirmed'
    | 'favorite'
    | 'message'
    | 'new_listing'
    | 'price_drop'
    | 'featured_expiring_soon'
    | 'featured_expired';

export interface SendNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

export interface NotifyPriceDropParams {
    listingId: string;
    oldPrice: number;
    newPrice: number;
    listingTitle?: string;
    imageUrl?: string | null;
    sellerId?: string;
}

/**
 * Notifica a todos los usuarios que tengan en favoritos un anuncio que ha bajado de precio.
 * Formato y emojis idénticos a Wallapop: "Bajada de precio 📉👀" y "{anuncio} es un X% más barato... ¡Que no se te escape!"
 */
export async function notifyPriceDrop({
    listingId,
    oldPrice,
    newPrice,
    listingTitle,
    imageUrl,
    sellerId,
}: NotifyPriceDropParams) {
    try {
        if (!oldPrice || !newPrice || newPrice >= oldPrice) {
            return { success: false, reason: "No price decrease" };
        }

        const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
        if (discountPercent < 1) {
            return { success: false, reason: "Discount less than 1%" };
        }

        let title = listingTitle;
        let img = imageUrl;
        let ownerId = sellerId;

        if (!title || img === undefined || !ownerId) {
            const { data: listingData } = await supabaseAdmin
                .from('listings')
                .select('title, image_urls, user_id')
                .eq('id', listingId)
                .single();

            if (listingData) {
                title = title || listingData.title;
                if (img === undefined) {
                    img = Array.isArray(listingData.image_urls) && listingData.image_urls.length > 0
                        ? listingData.image_urls[0]
                        : null;
                }
                ownerId = ownerId || listingData.user_id;
            }
        }

        const safeTitle = title || 'Un artículo que sigues';

        // 1. Obtener todos los usuarios que han marcado en favoritos este anuncio
        const { data: favorites, error: favError } = await supabaseAdmin
            .from('favorites')
            .select('user_id')
            .eq('listing_id', listingId);

        if (favError || !favorites || favorites.length === 0) {
            return { success: true, notified: 0 };
        }

        // Excluir al propio vendedor si se hubiese dado favorito a sí mismo
        const targetUsers = favorites.filter(f => f.user_id !== ownerId);
        if (targetUsers.length === 0) {
            return { success: true, notified: 0 };
        }

        const notifTitle = 'Bajada de precio 📉👀';
        const notifBody = `"${safeTitle}" es un ${discountPercent}% más barato... ¡Que no se te escape!`;

        const notifPromises = targetUsers.map(f =>
            sendNotification({
                userId: f.user_id,
                type: 'price_drop',
                title: notifTitle,
                body: notifBody,
                data: {
                    url: `/anuncio/${listingId}`,
                    listing_id: listingId,
                    listing_title: safeTitle,
                    image_url: img,
                    old_price: oldPrice,
                    new_price: newPrice,
                    discount_percent: discountPercent,
                }
            })
        );

        await Promise.all(notifPromises);

        return { success: true, notified: targetUsers.length, discountPercent };
    } catch (err) {
        console.error("Error in notifyPriceDrop:", err);
        return { success: false, error: err };
    }
}

export interface NotifyFeaturedExpiringSoonParams {
    listingId: string;
    userId: string;
    listingTitle?: string;
    imageUrl?: string | null;
    favoritesCount: number;
}

/**
 * Notificación 1 día antes de que caduque el destacado.
 * Regla de negocio: Si el anuncio tiene <= 3 me gusta, se omite el aviso.
 * Título: 🔥 ¡Estás a punto de venderlo!
 * Mensaje: "{titulo}" ya tiene {X} me gusta ❤️ y tu destacado termina mañana. ¡Estás muy cerca de cerrarlo!
 */
export async function notifyFeaturedExpiringSoon({
    listingId,
    userId,
    listingTitle,
    imageUrl,
    favoritesCount,
}: NotifyFeaturedExpiringSoonParams) {
    if (favoritesCount <= 3) {
        return { success: true, skipped: true, reason: "Menos o igual a 3 favoritos" };
    }

    const safeTitle = listingTitle || "Tu anuncio destacado";
    const title = "🔥 ¡Estás a punto de venderlo!";
    const body = `"${safeTitle}" ya tiene ${favoritesCount} me gusta ❤️ y tu destacado termina mañana. ¡Estás muy cerca de cerrarlo!`;

    return sendNotification({
        userId,
        type: 'featured_expiring_soon',
        title,
        body,
        data: {
            url: `/anuncio/${listingId}`,
            listing_id: listingId,
            listing_title: safeTitle,
            image_url: imageUrl || null,
            favorites_count: favoritesCount,
        }
    });
}

export interface NotifyFeaturedExpiredParams {
    listingId: string;
    userId: string;
    listingTitle?: string;
    imageUrl?: string | null;
}

/**
 * Notificación el mismo día cuando caduca el destacado.
 * Anima al usuario a renovarlo para mantener visibilidad.
 * Título: 🚀 ¡No pierdas tu visibilidad!
 * Mensaje: El destacado de "{titulo}" ha terminado hoy. Renuévalo ahora para venderlo cuanto antes.
 */
export async function notifyFeaturedExpired({
    listingId,
    userId,
    listingTitle,
    imageUrl,
}: NotifyFeaturedExpiredParams) {
    const safeTitle = listingTitle || "Tu anuncio destacado";
    const title = "🚀 ¡No pierdas tu visibilidad!";
    const body = `El destacado de "${safeTitle}" ha terminado hoy. Renuévalo ahora para venderlo cuanto antes.`;

    return sendNotification({
        userId,
        type: 'featured_expired',
        title,
        body,
        data: {
            url: `/anuncio/${listingId}`,
            listing_id: listingId,
            listing_title: safeTitle,
            image_url: imageUrl || null,
        }
    });
}

export async function sendNotification({ userId, type, title, body, data = {} }: SendNotificationParams) {
    try {
        // 1. Save notification to the database
        const { error: dbError } = await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: userId,
                type,
                title,
                body,
                data
            });

        if (dbError) {
            console.error("Failed to save notification to database:", dbError);
            // We continue anyway to attempt sending the Push Notification
        }

        // 2. Fetch the user's Expo Push Token
        const { data: userData, error: userError } = await supabaseAdmin
            .from("users")
            .select("expo_push_token")
            .eq("id", userId)
            .single();

        if (userError || !userData?.expo_push_token) {
            console.log(`No push token found for user ${userId}, skipping push notification.`);
            return { success: true, pushSent: false };
        }

        // 3. Send Push Notification via Expo
        const pushToken = userData.expo_push_token;
        const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: pushToken,
                sound: 'default',
                title,
                body,
                data,
            }),
        });

        if (!pushResponse.ok) {
            console.error("Expo Push API returned an error:", await pushResponse.text());
            return { success: false, pushSent: false };
        }

        return { success: true, pushSent: true };
    } catch (error) {
        console.error("Error in sendNotification:", error);
        return { success: false, error };
    }
}
