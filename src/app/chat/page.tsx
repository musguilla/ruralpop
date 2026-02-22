import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ChatInboxList } from "@/components/chat/ChatInboxList";

export const dynamic = "force-dynamic";

export default async function ChatInboxPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: messages, error } = await supabase
        .from("messages")
        .select(`
      id,
      content,
      created_at,
      listing_id,
      sender_id,
      receiver_id,
      is_read,
      listing:listings(title, image_urls),
      sender:users!messages_sender_id_fkey(name, avatar_url),
      receiver:users!messages_receiver_id_fkey(name, avatar_url)
    `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching messages:", error);
    }

    // Lógica para agrupar mensajes en hilos de conversación únicos
    const threadsMap = new Map<string, any>();
    messages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const threadKey = `${msg.listing_id}-${otherUserId}`;
        const isUnreadForMe = msg.receiver_id === user.id && msg.is_read === false;

        if (!threadsMap.has(threadKey)) {
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
            threadsMap.set(threadKey, {
                lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    created_at: msg.created_at,
                    sender_id: msg.sender_id
                },
                otherUser: otherUser as { name: string; avatar_url: string | null },
                listing: msg.listing as { title: string; image_urls: string[] | null },
                listingId: msg.listing_id,
                otherUserId,
                unreadCount: isUnreadForMe ? 1 : 0
            });
        } else {
            if (isUnreadForMe) {
                threadsMap.get(threadKey)!.unreadCount += 1;
            }
        }
    });

    const threads = Array.from(threadsMap.values());

    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        Mis Mensajes
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2">
                        Gestiona tus conversaciones y dudas sobre anuncios.
                    </p>
                </header>

                <ChatInboxList initialThreads={threads} userId={user.id} />
            </div>
        </div>
    );
}
