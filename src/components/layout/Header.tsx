import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, LogOut, MessageSquare, LayoutDashboard, Plus, Heart } from "lucide-react";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { ChatBadge } from "@/components/chat/ChatBadge";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartDropdown } from "@/components/layout/CartDropdown";

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch initial unread count
    const { count: unreadCount } = user ? await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false) : { count: 0 };

    let userRole = null;
    let isGhost = false;
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('role, is_ghost')
            .eq('id', user.id)
            .single();
        userRole = profile?.role;
        isGhost = profile?.is_ghost || false;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo and Brand */}
                <Link
                    href="/"
                    className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-md px-1 flex-shrink-0"
                >
                    <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain w-auto h-6 sm:h-8 md:h-[40px]" priority />
                </Link>

                {/* Empty flex-1 to push actions to the right */}
                <div className="flex-1 min-w-2 sm:mx-4" />

                {/* Actions Navigation */}
                <nav className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <Link
                        href={isGhost ? "/profesionales?ghost_claim=true" : "/upload"}
                        className="group flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium bg-[var(--ag-sys-color-primary)] text-white rounded-full hover:bg-[var(--ag-sys-color-primary-hover)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]"
                    >
                        <div className="bg-white/20 rounded-full p-0.5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="hidden sm:inline">{isGhost ? "Finalizar Activación" : "Vender"}</span>
                        <span className="sm:hidden">{isGhost ? "Activar" : "Vender"}</span>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <Link
                                    href="/favoritos"
                                    className="hidden sm:flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full"
                                    aria-label="Mis Favoritos"
                                    title="Mis Favoritos"
                                >
                                    <Heart className="w-6 h-6" />
                                </Link>
                                <Link
                                    href="/chat"
                                    className="flex items-center gap-2 p-2 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-full relative"
                                    aria-label="Mis Mensajes"
                                    title="Mis Mensajes"
                                >
                                    <ChatBadge initialCount={unreadCount || 0} userId={user.id} />
                                </Link>
                                <CartDropdown />
                            </div>

                            {/* Componente Cliente para el Menú Desplegable */}
                            <UserMenu
                                userFullName={user.user_metadata?.name || ''}
                                userId={user.id}
                                avatarUrl={user.user_metadata?.avatar_url}
                                role={userRole}
                                isGhost={isGhost}
                            />
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
                    
                    {/* Para usuarios anónimos mostramos la cesta también */}
                    {!user && <CartDropdown />}
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
