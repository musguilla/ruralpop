"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    ArrowLeft, 
    MessageSquare, 
    Calendar, 
    User, 
    Tractor, 
    ChevronRight, 
    ExternalLink, 
    X,
    MessageCircle,
    Info
} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/utils/mediaUtils";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { 
    getUserChatsAction, 
    getChatMessagesAction, 
    ChatThread, 
    ChatMessage, 
    UserProfile 
} from "@/app/admin/insights/actions";

interface UserChatsExplorerProps {
    userId: string;
    onClose: () => void;
}

function ThreadsListSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center gap-3 p-4 border border-[var(--ag-sys-color-border)] rounded-xl bg-gray-50/50">
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MessagesSkeleton() {
    return (
        <div className="space-y-4 p-4 animate-pulse h-full flex flex-col justify-end">
            {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`flex ${n % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`w-2/3 space-y-2 p-4 rounded-2xl bg-gray-100 ${n % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`}>
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-2 bg-gray-200 rounded w-1/6 self-end" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function UserChatsExplorer({ userId, onClose }: UserChatsExplorerProps) {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // View state for responsive layout: true = show chat thread panel on mobile
    const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to the end of messages when loaded
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Load initial user details and threads
    useEffect(() => {
        async function loadUserData() {
            try {
                setLoading(true);
                setError(null);
                const data = await getUserChatsAction(userId);
                setTargetUser(data.targetUser);
                setThreads(data.threads);
            } catch (err: unknown) {
                console.error("Error loading user chats details:", err);
                setError(err instanceof Error ? err.message : "Error desconocido al cargar datos");
            } finally {
                setLoading(false);
            }
        }
        
        loadUserData();
    }, [userId]);

    // Load messages when an active thread is selected
    useEffect(() => {
        if (!activeThread) return;

        const otherUserId = activeThread.otherUserId;
        const listingId = activeThread.listingId;

        async function loadMessages() {
            try {
                setLoadingMessages(true);
                const data = await getChatMessagesAction(
                    userId,
                    otherUserId,
                    listingId
                );
                setMessages(data.messages);
            } catch (err: unknown) {
                console.error("Error loading messages detail:", err);
            } finally {
                setLoadingMessages(false);
            }
        }

        loadMessages();
    }, [activeThread, userId]);

    const handleSelectThread = (thread: ChatThread) => {
        setActiveThread(thread);
        setShowThreadOnMobile(true);
    };

    const handleBackToThreadsMobile = () => {
        setShowThreadOnMobile(false);
    };

    if (loading) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-6 shadow-sm min-h-[600px] flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-500 bg-gray-50 border border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    <div className="col-span-1 border-r border-[var(--ag-sys-color-border)] pr-4">
                        <ThreadsListSkeleton />
                    </div>
                    <div className="col-span-2 bg-gray-50/50 rounded-2xl border border-[var(--ag-sys-color-border)] h-[500px]">
                        <MessagesSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                    <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar chats</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">{error}</p>
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                >
                    Volver a Insights
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-4 md:p-6 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-in fade-in duration-300">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--ag-sys-color-border)] pb-4 mb-4 gap-3">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 bg-gray-50 border border-gray-200 transition-all hover:scale-105"
                        title="Volver a Insights"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-[var(--ag-sys-color-primary)]" />
                            Chats de {targetUser?.name || targetUser?.email || "Usuario"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            ID: {targetUser?.id} • {targetUser?.email}
                        </p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-bold flex items-center gap-1.5 self-end sm:self-auto">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {threads.length} hilos de conversación activos
                </div>
            </div>

            {/* Split Screen Explorer */}
            <div className="flex flex-1 gap-6 overflow-hidden relative">
                {/* Left Side: Threads List */}
                <div className={`w-full md:w-1/3 flex flex-col overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${showThreadOnMobile ? "hidden md:flex" : "flex"}`}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Conversaciones</h3>
                    {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex-1 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-500">Este usuario no tiene chats registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {threads.map((thread) => {
                                const isSelected = activeThread?.listingId === thread.listingId && activeThread?.otherUserId === thread.otherUserId;
                                const isTargetSender = thread.lastMessage.sender_id === userId;
                                
                                return (
                                    <button
                                        key={`${thread.listingId}-${thread.otherUserId}`}
                                        onClick={() => handleSelectThread(thread)}
                                        className={`w-full text-left p-3.5 rounded-2xl border flex gap-3 transition-all duration-200 group relative ${
                                            isSelected 
                                                ? "border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5 shadow-sm" 
                                                : "border-[var(--ag-sys-color-border)] hover:border-gray-300 hover:bg-gray-50/50"
                                        }`}
                                    >
                                        {/* Listing Thumbnail */}
                                        <div className="relative w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                                            {thread.listing?.image_urls?.[0] ? (
                                                <Image 
                                                    src={getImageUrl(thread.listing.image_urls[0])} 
                                                    alt="" 
                                                    fill 
                                                    className="object-cover" 
                                                    sizes="48px" 
                                                />
                                            ) : (
                                                <Tractor className="w-6 h-6 text-gray-400 opacity-40" />
                                            )}
                                        </div>

                                        {/* Thread Text */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className="text-xs font-black text-gray-700 truncate group-hover:text-[var(--ag-sys-color-primary)] transition-colors">
                                                    {thread.listing?.title || "Anuncio Eliminado"}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {formatRelativeTime(thread.lastMessage.created_at)}
                                                </span>
                                            </div>
                                            
                                            {/* Interlocutor */}
                                            <div className="flex items-center gap-1 mt-1">
                                                <User className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 truncate">
                                                    Con: {thread.otherUser?.name || thread.otherUser?.email || "Usuario"}
                                                </span>
                                            </div>

                                            {/* Message Snippet */}
                                            <p className="text-xs text-gray-400 truncate mt-1.5 italic">
                                                {isTargetSender ? "Enviado: " : "Recibido: "}
                                                {thread.lastMessage.content}
                                            </p>
                                        </div>

                                        {/* Message Count Indicator */}
                                        <div className="absolute right-3.5 bottom-3.5 flex items-center justify-center bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                                            {thread.messageCount} msg
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Side: Message Thread Pane */}
                <div className={`w-full md:w-2/3 flex flex-col border border-[var(--ag-sys-color-border)] rounded-3xl bg-gray-50/30 overflow-hidden h-full max-h-full transition-all duration-300 ${showThreadOnMobile ? "flex" : "hidden md:flex"}`}>
                    {activeThread ? (
                        <div className="flex flex-col flex-1 h-full overflow-hidden">
                            {/* Chat Window Header */}
                            <div className="bg-white border-b border-[var(--ag-sys-color-border)] p-4 flex justify-between items-center gap-4 shadow-sm flex-shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Mobile Back Button */}
                                    <button 
                                        onClick={handleBackToThreadsMobile}
                                        className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-500 mr-1"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="relative w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center">
                                        {activeThread.listing?.image_urls?.[0] ? (
                                            <Image 
                                                src={getImageUrl(activeThread.listing.image_urls[0])} 
                                                alt="" 
                                                fill 
                                                className="object-cover" 
                                                sizes="40px" 
                                            />
                                        ) : (
                                            <Tractor className="w-5 h-5 text-gray-400 opacity-40" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-800 truncate leading-tight">
                                            {activeThread.listing?.title || "Anuncio Eliminado"}
                                        </h4>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {activeThread.listing ? formatCurrency(activeThread.listing.price) : "S/D"} • Interlocutor: <span className="font-bold text-gray-600">{activeThread.otherUser?.name || "Usuario"}</span>
                                        </p>
                                    </div>
                                </div>
                                {activeThread.listing && (
                                    <a
                                        href={`/anuncio/${slugify(activeThread.listing.title)}-${encodeId(activeThread.listing.id)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-2 bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 hover:scale-[1.02]"
                                        title="Ver anuncio público"
                                    >
                                        Ver Anuncio <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>

                            {/* Chat Thread Messages Box */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {loadingMessages ? (
                                    <MessagesSkeleton />
                                ) : (
                                    <>
                                        {messages.map((message) => {
                                            const isMe = message.sender_id === userId;
                                            const senderName = isMe 
                                                ? (targetUser?.name || "Usuario Inspeccionado") 
                                                : (activeThread.otherUser?.name || "Interlocutor");
                                                
                                            return (
                                                <div 
                                                    key={message.id} 
                                                    className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                                                >
                                                    {/* Sender Indicator */}
                                                    <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                                                        {senderName}
                                                    </span>

                                                    {/* Message bubble */}
                                                    <div 
                                                        className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                                                            isMe 
                                                                ? "bg-[var(--ag-sys-color-primary)] text-white rounded-tr-none" 
                                                                : "bg-white text-gray-800 border border-[var(--ag-sys-color-border)] rounded-tl-none"
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-line leading-relaxed font-medium">
                                                            {message.content}
                                                        </p>
                                                        <div 
                                                            className={`text-[9px] mt-1.5 text-right font-semibold ${
                                                                isMe ? "text-green-100" : "text-gray-400"
                                                            }`}
                                                        >
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-gray-50/20">
                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4 animate-bounce">
                                <MessageCircle className="w-8 h-8 opacity-40" />
                            </div>
                            <h4 className="text-base font-bold text-gray-700 mb-1">Sin conversación seleccionada</h4>
                            <p className="text-xs text-gray-500 max-w-sm">
                                Selecciona un anuncio de la lista de la izquierda para desplegar el historial de mensajes de este chat.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Implementación de un diseño de doble columna responsivo (Thread list a la izquierda y Message box a la derecha).
 * - En móviles, se utiliza un estado de visualización para conmutar entre pantallas y optimizar la usabilidad del inspector.
 * - Desplazamiento automático (auto-scroll) optimizado hacia el final del hilo de mensajes al cargar.
 * - Inyección y uso estricto de los tokens oficiales de diseño Antigravity (`var(--ag-sys-color-...)`).
 * - Tipado total sin uso de 'any' para garantizar la robustez técnica solicitada.
 */
