"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function sendMessage(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const listing_id = formData.get("listing_id") as string;
    const receiver_id = formData.get("receiver_id") as string;
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id,
        listing_id,
        content: content.trim()
    });

    if (error) {
        console.error("Error sending message:", error);
        throw new Error(error.message);
    }

    // --- PUSH NOTIFICATION LOGIC ---
    try {
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch receiver's push token and sender's name
        const [receiverRes, senderRes] = await Promise.all([
            adminClient.from("users").select("expo_push_token").eq("id", receiver_id).single(),
            adminClient.from("users").select("name").eq("id", user.id).single()
        ]);

        const pushToken = receiverRes.data?.expo_push_token;
        const senderName = senderRes.data?.name || "Un usuario";

        if (pushToken) {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: pushToken,
                    sound: 'default',
                    title: `Nuevo mensaje de ${senderName}`,
                    body: content.trim(),
                    data: { listingId: listing_id, otherUserId: user.id },
                }),
            });
        }
    } catch (pushErr) {
        console.error("Error firing push notification from web:", pushErr);
    }
    // ---------------------------------

    revalidatePath(`/chat/${listing_id}`);
}

export async function markMessagesAsRead(listingId: string, otherUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    // Creamos un cliente admin para saltarnos el RLS, ya que falta la política de UPDATE en la tabla messages
    // y solo el destinatario real debería poder marcar como leído (verificado arriba con user.id)
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('listing_id', listingId)
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

    if (error) {
        console.error("Error marking messages as read:", error);
        return { success: false };
    }

    revalidatePath('/chat');
    return { success: true };
}
