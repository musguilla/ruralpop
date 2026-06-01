import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ChatInboxList } from "@/components/chat/ChatInboxList";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getServerTenantFilterString } from "@/utils/tenant/server";

export const dynamic = "force-dynamic";

export default async function ChatInboxPage() {
    const headersList = await headers();
    const locale = (headersList.get("x-locale") || "es") as LocaleCode;
    const dict = await getDictionary(locale);
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
        .or(await getServerTenantFilterString())
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching messages:", error);
    }

    // Lógica para agrupar mensajes en hilos de conversación únicos
    const threadsMap = new Map<string, any>();
    const missingListingIds = new Set<string>();

    messages?.forEach((msg: any) => {
        if (!msg.listing && msg.listing_id) {
            missingListingIds.add(msg.listing_id);
        }
    });

    // Fetch listings that are hidden by RLS (e.g. status = 'sold') using service role
    const adminListingsMap = new Map<string, any>();
    if (missingListingIds.size > 0) {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!, 
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: missingListings } = await adminSupabase
            .from("listings")
            .select("id, title, image_urls")
            .in("id", Array.from(missingListingIds));
            
        missingListings?.forEach(l => {
            adminListingsMap.set(l.id, l);
        });
    }

    messages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const threadKey = `${msg.listing_id}-${otherUserId}`;
        const isUnreadForMe = msg.receiver_id === user.id && msg.is_read === false;

        if (!threadsMap.has(threadKey)) {
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
            const listingData = msg.listing || adminListingsMap.get(msg.listing_id);
            threadsMap.set(threadKey, {
                lastMessage: {
                    id: msg.id,
                    content: msg.content,
                    created_at: msg.created_at,
                    sender_id: msg.sender_id
                },
                otherUser: otherUser as { name: string; avatar_url: string | null },
                listing: listingData as { title: string; image_urls: string[] | null },
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
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 w-full">
            <div className="container mx-auto px-4 max-w-6xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                        {dict.chat.title}
                    </h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-2">
                        {dict.chat.desc}
                    </p>
                </header>

                <ChatInboxList initialThreads={threads} userId={user.id} />
            </div>
        </div>
    );
}
