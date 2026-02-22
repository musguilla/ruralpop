"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

    revalidatePath(`/chat/${listing_id}`);
}

export async function markMessagesAsRead(listingId: string, otherUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
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
