import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/utils/format";
import { MessageSquare, User, Tractor, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatInboxPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Obtenemos todos los mensajes donde el usuario es remitente o destinatario
    // Agrupamos por listing_id y el "otro" usuario para simular hilos de conversación
    const { data: messages, error } = await supabase
        .from("messages")
        .select(`
      id,
      content,
      created_at,
      listing_id,
      sender_id,
      receiver_id,
      listing:listings(title, image_urls),
      sender:users!messages_sender_id_fkey(name, avatar_url),
      receiver:users!messages_receiver_id_fkey(name, avatar_url)
    `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching messages:", error);
    }

    interface Message {
        id: string;
        content: string;
        created_at: string;
        sender_id: string;
    }

    interface Thread {
        lastMessage: Message;
        otherUser: { name: string; avatar_url: string | null };
        listing: { title: string; image_urls: string[] | null };
        listingId: string;
        otherUserId: string;
    }

    // Lógica para agrupar mensajes en hilos de conversación únicos
    const threadsMap = new Map<string, Thread>();
    messages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const threadKey = `${msg.listing_id}-${otherUserId}`;

        if (!threadsMap.has(threadKey)) {
            const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
            threadsMap.set(threadKey, {
                lastMessage: msg as unknown as Message,
                otherUser: otherUser as unknown as { name: string; avatar_url: string | null },
                listing: msg.listing as unknown as { title: string; image_urls: string[] | null },
                listingId: msg.listing_id,
                otherUserId
            });
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

                {threads.length === 0 ? (
                    <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">Aún no tienes mensajes</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] mb-6">
                            Cuando contactes con un vendedor o te pregunten por un anuncio, aparecerán aquí.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex py-3 px-6 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all"
                        >
                            Explorar anuncios
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {threads.map((thread) => (
                            <Link
                                key={`${thread.listingId}-${thread.otherUserId}`}
                                href={`/chat/${thread.listingId}?u=${thread.otherUserId}`}
                                className="block bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)] p-4 sm:p-6 hover:border-[var(--ag-sys-color-primary)] hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Listing Image */}
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-[var(--ag-sys-color-background)] rounded-xl overflow-hidden border border-[var(--ag-sys-color-border)]">
                                        {thread.listing?.image_urls?.[0] ? (
                                            <Image src={thread.listing.image_urls[0]} alt="" fill className="object-cover" sizes="80px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)]">
                                                <Tractor className="w-8 h-8 opacity-20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Thread Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-bold text-[var(--ag-sys-color-text)] truncate group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                                {thread.listing?.title}
                                            </h4>
                                            <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] whitespace-nowrap ml-2">
                                                {formatRelativeTime(thread.lastMessage.created_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="relative w-5 h-5 rounded-full bg-[var(--ag-sys-color-background)] flex items-center justify-center text-[var(--ag-sys-color-primary)] overflow-hidden border border-[var(--ag-sys-color-border)]">
                                                {thread.otherUser?.avatar_url ? (
                                                    <Image src={thread.otherUser.avatar_url} alt="" fill className="object-cover" sizes="20px" />
                                                ) : (
                                                    <User className="w-3 h-3" />
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--ag-sys-color-text-muted)]">
                                                {thread.otherUser?.name || "Usuario"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-[var(--ag-sys-color-text-muted)] line-clamp-1 italic">
                                            {thread.lastMessage.sender_id === user.id ? "Tú: " : ""}
                                            {thread.lastMessage.content}
                                        </p>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-[var(--ag-sys-color-border)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
