"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Heart, MessageSquare, Briefcase, HelpCircle, LogOut, ChevronDown, UserCircle2, Handshake, Tag, Wallet } from "lucide-react";
import { ChatBadge } from "@/components/chat/ChatBadge";
import { getImageUrl } from "@/utils/mediaUtils";
import { createClient } from "@/utils/supabase/client";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { useTranslation } from "@/context/LocaleContext";

interface UserMenuProps {
    userFullName: string;
    userId: string;
    avatarUrl?: string | null;
    role?: string | null;
    isGhost?: boolean;
}

export function UserMenu({ userFullName, userId, avatarUrl, role, isGhost }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

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

    const handleLogout = async () => {
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            window.location.href = "/";
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-1 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Menú de usuario"
            >
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm overflow-hidden">
                    {avatarUrl ? (
                        <img src={getImageUrl(avatarUrl)} alt={userFullName || 'Avatar'} className="w-full h-full object-cover" />
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
                        {isGhost ? (
                            <LocalizedLink
                                href="/profesionales?ghost_claim=true"
                                className="flex px-4 py-3 hover:bg-[var(--ag-sys-color-primary)]/5 transition-colors group border-b border-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Briefcase className="w-5 h-5 text-amber-500" />
                                    <div className="flex flex-col items-start gap-1 flex-1">
                                        <div className="flex w-full items-center justify-between">
                                            <span className="font-semibold leading-none text-amber-600 group-hover:text-amber-700">Completar Activación</span>
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-1"></span>
                                        </div>
                                    </div>
                                </div>
                            </LocalizedLink>
                        ) : (
                            <>
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-[11px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Transacciones</p>
                                </div>
                                <LocalizedLink
                                    href="/dashboard/compras"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Handshake className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Compras</span>
                                </LocalizedLink>
                                <LocalizedLink
                                    href="/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Tag className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Ventas</span>
                                </LocalizedLink>
                                <LocalizedLink
                                    href="/dashboard/monedero"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Wallet className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Monedero</span>
                                </LocalizedLink>

                                <div className="px-4 pt-4 pb-1 border-t border-gray-100 mt-1">
                                    <p className="text-[11px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider">Cuenta</p>
                                </div>
                                <LocalizedLink
                                    href="/favoritos"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Heart className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Favoritos</span>
                                </LocalizedLink>
                                <LocalizedLink
                                    href="/chat"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <MessageSquare className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Mensajes</span>
                                </LocalizedLink>
                                <LocalizedLink
                                    href="/account"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-800">Perfil</span>
                                </LocalizedLink>

                                <div className="my-1 border-t border-gray-100"></div>

                                {role === 'profesional' ? (
                                    <LocalizedLink
                                        href="/dashboard/pro"
                                        className="flex px-4 py-3 hover:bg-[var(--ag-sys-color-primary)]/5 transition-colors group"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <Briefcase className="w-5 h-5 text-[var(--ag-sys-color-primary)]" />
                                            <div className="flex flex-col items-start gap-1 flex-1">
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="font-semibold leading-none text-[var(--ag-sys-color-text)] group-hover:text-[var(--ag-sys-color-primary)]">Panel Profesional</span>
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                ) : (
                                    <LocalizedLink
                                        href="/profesionales"
                                        className="flex px-4 py-3 hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Briefcase className="w-5 h-5 mt-1" />
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full leading-none whitespace-nowrap">NUEVO</span>
                                                <span className="font-semibold leading-none mt-1">¿Eres profesional?</span>
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                )}

                                <LocalizedLink
                                    href="/contact"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <HelpCircle className="w-5 h-5" />
                                    <span className="font-semibold">Ayuda</span>
                                </LocalizedLink>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold">{t("cerrar_sesion")}</span>
                        </button>
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
