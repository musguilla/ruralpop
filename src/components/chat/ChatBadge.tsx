"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ChatBadgeProps {
    initialCount: number;
    userId: string;
}

export function ChatBadge({ initialCount, userId }: ChatBadgeProps) {
    const [unreadCount, setUnreadCount] = useState(initialCount);
    const supabase = createClient();

    useEffect(() => {
        setUnreadCount(initialCount);
    }, [initialCount]);

    useEffect(() => {
        // Suscribirse a inserciones para subir el contador de no leídos
        // y a actualizaciones (cuando se lee el mensaje) para bajarlo.
        const channel = supabase
            .channel("realtime-badge")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `receiver_id=eq.${userId}`,
                },
                (payload: any) => {
                    if (payload.new && payload.new.is_read === false) {
                        setUnreadCount((prev) => prev + 1);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `receiver_id=eq.${userId}`,
                },
                (payload: any) => {
                    // Al no tener REPLICA IDENTITY FULL en Postgres por defecto, old suele venir vacío salvo el ID.
                    // Si recibimos un update donde viene is_read a true, asumimos que acaba de leerse.
                    if (payload.new && payload.new.is_read === true) {
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, userId]);

    return (
        <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full animate-in zoom-in spin-in shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </div>
    );
}
