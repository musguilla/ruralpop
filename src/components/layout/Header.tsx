import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, LogOut, MessageSquare, LayoutDashboard, Plus, Heart } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { ChatBadge } from "@/components/chat/ChatBadge";

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch initial unread count
    const { count: unreadCount } = user ? await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false) : { count: 0 };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo and Brand */}
                <Link
                    href="/"
                    className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-md px-1"
                >
                    <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain" priority />
                </Link>

                {/* Empty flex-1 to push actions to the right */}
                <div className="flex-1 mx-4" />

                {/* Actions Navigation */}
                <nav className="flex items-center gap-4">
                    <Link
                        href="/upload"
                        className="group hidden sm:flex items-center justify-center gap-2 px-4 py-2 font-medium bg-[var(--ag-sys-color-primary)] text-white rounded-full hover:bg-[var(--ag-sys-color-primary-hover)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]"
                    >
                        <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                        Vender
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden md:inline-block text-sm font-medium text-[var(--ag-sys-color-text-muted)]">
                                Hola, {user.user_metadata?.name?.split(' ')[0] || 'Usuario'}
                            </span>
                            <div className="flex items-center gap-1">
                                <Link
                                    href="/favoritos"
                                    className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full"
                                    aria-label="Mis Favoritos"
                                    title="Mis Favoritos"
                                >
                                    <Heart className="w-6 h-6" />
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full"
                                    aria-label="Mi Panel"
                                    title="Mi Panel"
                                >
                                    <LayoutDashboard className="w-6 h-6" />
                                </Link>
                                <Link
                                    href="/chat"
                                    className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full relative"
                                    aria-label="Mis Mensajes"
                                    title="Mis Mensajes"
                                >
                                    <ChatBadge initialCount={unreadCount || 0} userId={user.id} />
                                </Link>
                            </div>
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full"
                                    aria-label="Cerrar Sesión"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-6 h-6" />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full"
                            aria-label="Perfil o Iniciar Sesión"
                            title="Iniciar Sesión"
                        >
                            <UserCircle className="w-8 h-8" />
                        </Link>
                    )}
                </nav>
            </div>

        </header>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Uso estricto de variables 'var(--ag-sys-color-X)' para mantener el sistema unificado.
 * - Header ahora es un Server Component async para determinar auth_state sin flickers de carga al cliente.
 * - 'logout' se pasa usando action de Next puramente server-side.
 */
