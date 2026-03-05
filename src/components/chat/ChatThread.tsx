"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, Tractor, ArrowLeft } from "lucide-react";
import { sendMessage, markMessagesAsRead } from "@/app/chat/actions";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/utils/format";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    is_read?: boolean;
    created_at: string;
}

interface ChatThreadProps {
    listing: { id: string; title: string; image_urls: string[] | null };
    initialMessages: Message[];
    currentUser: { id: string };
    otherUser: { id: string; name: string };
}

export function ChatThread({ listing, initialMessages, currentUser, otherUser }: ChatThreadProps) {
    const { showAlert } = useNotification();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [content, setContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const markAsRead = async () => {
            try {
                const unreadFromOther = messages.filter(
                    (m) => m.sender_id === otherUser.id && m.is_read !== true
                );

                if (unreadFromOther.length > 0) {
                    await markMessagesAsRead(listing.id, otherUser.id);
                    // Disparar evento para que el Badge (global) y la bandeja se enteren inmediatamente
                    window.dispatchEvent(new CustomEvent("chat-read", {
                        detail: {
                            count: unreadFromOther.length,
                            listingId: listing.id,
                            otherUserId: otherUser.id
                        }
                    }));

                    // Actualizar estado local para que no vuelva a dispararse este efecto
                    setMessages(prev => prev.map(m =>
                        (m.sender_id === otherUser.id && m.is_read !== true)
                            ? { ...m, is_read: true }
                            : m
                    ));
                }
            } catch (err) {
                console.error("Error al marcar como leídos:", err);
            }
        };

        markAsRead();
    }, [messages, listing.id, otherUser.id]);

    useEffect(() => {
        // Configurar canal de Supabase Realtime para mensajes nuevos
        const channel = supabase
            .channel("realtime-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `listing_id=eq.${listing.id}`,
                },
                (payload: { new: Message & { receiver_id: string } }) => {
                    const newMessage = payload.new;
                    // Verificar si el mensaje pertenece a esta conversación específica
                    if (
                        (newMessage.sender_id === currentUser.id && payload.new.receiver_id === otherUser.id) ||
                        (newMessage.sender_id === otherUser.id && payload.new.receiver_id === currentUser.id)
                    ) {
                        setMessages((prev) => {
                            // Evitar duplicados nativos
                            if (prev.find(m => m.id === newMessage.id)) return prev;

                            // Reemplazar mensaje optimista temporal que contenga este mismo texto (si fuera propio)
                            const isMine = newMessage.sender_id === currentUser.id;
                            if (isMine) {
                                // Borramos el optimista y metemos el real de DB
                                const withoutTemp = prev.filter(m => !(m.id.startsWith("temp-") && m.content === newMessage.content));
                                return [...withoutTemp, newMessage];
                            }

                            return [...prev, newMessage];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, listing.id, currentUser.id, otherUser.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const tempContent = content;
        setContent("");

        // Optimistic UI update: Mostramos el mensaje antes de que llegue a base de datos
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: currentUser.id,
            content: tempContent,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        const formData = new FormData();
        formData.append("listing_id", listing.id);
        formData.append("receiver_id", otherUser.id);
        formData.append("content", tempContent);

        try {
            await sendMessage(formData);
        } catch (err) {
            console.error(err);
            showAlert({
                title: "Error al enviar",
                message: "No se ha podido enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.",
                type: "error"
            });
            setContent(tempContent);
            // Revertir optimismo en caso de caída
            setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] max-h-[800px] bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2.5rem] overflow-hidden shadow-xl">
            {/* Header del Chat */}
            <div className="p-4 sm:p-6 bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-2xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden">
                        {listing.image_urls?.[0] ? (
                            <Image src={listing.image_urls[0]} alt="" fill className="object-cover" sizes="48px" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-text-muted)]">
                                <Tractor className="w-6 h-6 opacity-20" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--ag-sys-color-text)] text-sm sm:text-base line-clamp-1">
                            {listing.title}
                        </h3>
                        <p className="text-xs text-[var(--ag-sys-color-text-muted)] font-medium">
                            Hablando con <span className="text-[var(--ag-sys-color-primary)]">{otherUser.name}</span>
                        </p>
                    </div>
                </div>
                <Link
                    href="/chat"
                    className="p-2 rounded-full hover:bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text-muted)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
            </div>

            {/* Cuerpo de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 hide-scrollbar bg-[var(--ag-sys-color-background)]/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <div className="w-16 h-16 bg-[var(--ag-sys-color-surface)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--ag-sys-color-border)]">
                            <Tractor className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">Inicia la conversación preguntando algo sobre el anuncio.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.sender_id === currentUser.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[70%] lg:max-w-[55%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${isMine
                                    ? "bg-[var(--ag-sys-color-primary)] text-white rounded-tr-none"
                                    : "bg-[var(--ag-sys-color-surface)] text-[var(--ag-sys-color-text)] border border-[var(--ag-sys-color-border)] rounded-tl-none"
                                    }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-[var(--ag-sys-color-text-muted)] mt-1.5 px-1 font-medium">
                                    {formatRelativeTime(msg.created_at)}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 sm:p-6 bg-[var(--ag-sys-color-surface)] border-t border-[var(--ag-sys-color-border)]">
                <form onSubmit={handleSend} className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="w-full h-12 pl-5 pr-12 rounded-2xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[var(--ag-sys-color-primary)] text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-md shadow-[var(--ag-sys-color-primary)]/20"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
