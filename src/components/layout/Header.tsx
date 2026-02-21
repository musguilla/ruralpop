import React from "react";
import Link from "next/link";
import { Tractor, UserCircle, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";
import { SearchInput } from "../ui/SearchInput";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo and Brand */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] rounded-md px-1"
                >
                    <Tractor className="w-8 h-8" />
                    <span className="text-xl font-bold tracking-tight hidden sm:inline-block text-[var(--ag-sys-color-text)]">
                        Ruralpop
                    </span>
                </Link>

                {/* Search Bar - Takes up remaining space gracefully */}
                <div className="flex-1 max-w-2xl hidden md:flex mx-4 justify-center">
                    <SearchInput />
                </div>

                {/* Actions Navigation */}
                <nav className="flex items-center gap-4">
                    <Link
                        href="/upload"
                        className="hidden sm:flex items-center justify-center px-4 py-2 font-medium bg-[var(--ag-sys-color-primary)] text-white rounded-full hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]"
                    >
                        Subir Anuncio
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden md:inline-block text-sm font-medium text-[var(--ag-sys-color-text-muted)]">
                                Hola, {user.user_metadata?.name?.split(' ')[0] || 'Usuario'}
                            </span>
                            <div className="flex items-center gap-1">
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
                                    <MessageSquare className="w-6 h-6" />
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

            {/* Mobile Search - Visible only on small screens below header */}
            <div className="md:hidden px-4 pb-3 pt-1">
                <SearchInput />
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
