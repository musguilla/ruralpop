"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Tractor, ChevronRight, MessageSquare, User } from "lucide-react";
import { formatRelativeTime } from "@/utils/format";
import { getImageUrl } from "@/utils/mediaUtils";
import { useTranslation } from "@/context/LocaleContext";

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
    unreadCount: number;
}

interface ChatInboxListProps {
    initialThreads: Thread[];
    userId: string;
}

export function ChatInboxList({ initialThreads, userId }: ChatInboxListProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const [threads, setThreads] = React.useState<Thread[]>(initialThreads);
    const supabase = createClient();

    // Sincronizar estado local cuando cambian las props del servidor y forzar refresco al montar
    useEffect(() => {
        setThreads(initialThreads);
        // Forzamos un refresco al montar para asegurar que el cache de Next.js no nos juegue una mala pasada
        // con los contadores de mensajes leídos en la navegación atrás/adelante.
        router.refresh();
    }, [initialThreads, router]);

    useEffect(() => {
        // Suscribirse a cambios en mensajes para refrescar la lista en tiempo real
        const channel = supabase
            .channel("realtime-inbox")
            .on(
                "postgres_changes",
                {
                    event: "*", // Escuchamos todo: nuevos mensajes, lecturas (updates), etc.
                    schema: "public",
                    table: "messages",
                },
                (payload: any) => {
                    // Si es un INSERT y somos el destinatario, refrescamos
                    if (payload.eventType === 'INSERT' && payload.new.receiver_id === userId) {
                        router.refresh();
                    }
                    // Si es un UPDATE y ha cambiado el estado de lectura, refrescamos
                    if (payload.eventType === 'UPDATE') {
                        router.refresh();
                    }
                }
            )
            .subscribe();

        // Escuchamos el evento manual de lectura para ser instantáneos y optimistas
        const handleManualRead = (e: any) => {
            const { listingId, otherUserId } = e.detail || {};
            if (listingId && otherUserId) {
                // Limpieza optimista local
                setThreads(prev => prev.map(t =>
                    (t.listingId === listingId && t.otherUserId === otherUserId)
                        ? { ...t, unreadCount: 0 }
                        : t
                ));
            }
            // Y avisamos al servidor por si acaso
            router.refresh();
        };

        window.addEventListener("chat-read", handleManualRead);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener("chat-read", handleManualRead);
        };
    }, [supabase, router, userId]);

    if (threads.length === 0) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)] rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">{t('chat.empty')}</h3>
                <p className="text-[var(--ag-sys-color-text-muted)] mb-6">
                    {t('favorites.empty_desc')}
                </p>
                <Link
                    href="/"
                    className="inline-flex py-3 px-6 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all"
                >
                    {t('favorites.explore_btn')}
                </Link>
            </div>
        );
    }

    return (
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
                            <div className="flex items-start justify-between mb-1 gap-2">
                                <h4 className={`font-bold truncate group-hover:text-[var(--ag-sys-color-primary)] transition-colors ${thread.unreadCount > 0 ? "text-[var(--ag-sys-color-text)]" : "text-[var(--ag-sys-color-text)]"}`}>
                                    {thread.listing?.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {thread.unreadCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                    <span className={`text-[10px] whitespace-nowrap ${thread.unreadCount > 0 ? "text-[var(--ag-sys-color-primary)] font-bold" : "text-[var(--ag-sys-color-text-muted)]"}`}>
                                        {formatRelativeTime(thread.lastMessage.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="relative w-5 h-5 rounded-full bg-[var(--ag-sys-color-background)] flex items-center justify-center text-[var(--ag-sys-color-primary)] overflow-hidden border border-[var(--ag-sys-color-border)]">
                                    {thread.otherUser?.avatar_url ? (
                                        <img src={getImageUrl(thread.otherUser.avatar_url)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-3 h-3" />
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-[var(--ag-sys-color-text-muted)]">
                                    {thread.otherUser?.name || "Usuario"}
                                </span>
                            </div>

                            <p className={`text-sm line-clamp-1 italic ${thread.unreadCount > 0 ? "text-[var(--ag-sys-color-text)] font-semibold" : "text-[var(--ag-sys-color-text-muted)]"}`}>
                                {thread.lastMessage.sender_id === userId ? `${t('chat.you')}: ` : ""}
                                {thread.lastMessage.content}
                            </p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-[var(--ag-sys-color-border)] group-hover:text-[var(--ag-sys-color-primary)] transition-colors" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
