import { createClient } from "@supabase/supabase-js";

// Initialize admin client to bypass RLS for inserting notifications and fetching push tokens
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type NotificationType = 'sale' | 'shipped' | 'receipt_confirmed' | 'favorite' | 'message';

export interface SendNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: any;
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
