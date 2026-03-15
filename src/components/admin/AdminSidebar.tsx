import React from "react";
import Link from "next/link";
import {
    Users,
    LayoutDashboard,
    Package,
    Settings,
    LogOut,
    Home,
    ShieldCheck,
    AlertCircle,
    DownloadCloud,
    Share2,
    FileText,
    Mail
} from "lucide-react";

export function AdminSidebar() {
    return (
        <aside className="w-64 bg-[var(--ag-sys-color-surface)] border-r border-[var(--ag-sys-color-border)] flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-[var(--ag-sys-color-border)] flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--ag-sys-color-primary)] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[var(--ag-sys-color-primary)]/20">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="font-bold text-[var(--ag-sys-color-text)] leading-none text-lg">Admin</h2>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--ag-sys-color-primary)] font-bold">Ruralpop</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <AdminNavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
                <AdminNavLink href="/admin/users" icon={<Users className="w-5 h-5" />} label="Usuarios" />
                <AdminNavLink href="/admin/listings" icon={<Package className="w-5 h-5" />} label="Anuncios" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Marketing</p>
                </div>
                <AdminNavLink href="/admin/marketing/social" icon={<Share2 className="w-5 h-5" />} label="Social Media" />
                <AdminNavLink href="/admin/marketing/cms" icon={<FileText className="w-5 h-5" />} label="CMS" />
                <AdminNavLink href="/admin/marketing/email" icon={<Mail className="w-5 h-5" />} label="Email marketing" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Sistema</p>
                </div>
                <AdminNavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" />
            </nav>

            <div className="p-4 border-t border-[var(--ag-sys-color-border)] space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary)]/5 rounded-xl transition-all"
                >
                    <Home className="w-5 h-5" />
                    Volver a la Web
                </Link>
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}

function AdminNavLink({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: string }) {
    return (
        <a
            href={href}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-primary)]/5 hover:text-[var(--ag-sys-color-primary)] rounded-xl transition-all group"
        >
            <div className="flex items-center gap-3">
                <span className="text-[var(--ag-sys-color-text-muted)] group-hover:text-[var(--ag-sys-color-primary)]">
                    {icon}
                </span>
                {label}
            </div>
            {badge && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {badge}
                </span>
            )}
        </a>
    );
}
