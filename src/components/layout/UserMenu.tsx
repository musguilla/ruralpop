"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, List, Heart, MessageSquare, Briefcase, HelpCircle, LogOut, ChevronDown, UserCircle2 } from "lucide-react";
import { ChatBadge } from "@/components/chat/ChatBadge";

interface UserMenuProps {
    userFullName: string;
    userId: string;
    avatarUrl?: string | null;
}

export function UserMenu({ userFullName, userId, avatarUrl }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Menú de usuario"
            >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={userFullName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : userFullName ? (
                        userFullName.charAt(0).toUpperCase()
                    ) : (
                        <UserCircle2 className="w-6 h-6" />
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 ml-1" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden text-gray-700 animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                        <Link
                            href="/account"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-semibold">Mi cuenta</span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <List className="w-5 h-5" />
                            <span className="font-semibold">Mis anuncios</span>
                        </Link>
                        <Link
                            href="/favoritos"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Heart className="w-5 h-5" />
                            <span className="font-semibold">Mis guardados</span>
                        </Link>
                        <Link
                            href="/chat"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-semibold">Mis mensajes</span>
                        </Link>

                        <div className="my-1 border-t border-gray-100"></div>

                        <div className="flex px-4 py-3 hover:bg-gray-50 transition-colors cursor-not-allowed opacity-80">
                            <div className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 mt-1" />
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-[9px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full leading-none">Próximamente</span>
                                    <span className="font-semibold leading-none mt-1">¿Eres profesional?</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/contact"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <HelpCircle className="w-5 h-5" />
                            <span className="font-semibold">Ayuda</span>
                        </Link>

                        <form action={async () => {
                            const { logout } = await import("@/app/auth/actions");
                            await logout();
                        }}>
                            <button
                                type="submit"
                                className="flex items-center w-full gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-semibold">Cerrar sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Menú premium basado en estados de React y estilos de Tailwind.
 * - Se aísla del Header Server Component para manejar clics (Client Component).
 */
