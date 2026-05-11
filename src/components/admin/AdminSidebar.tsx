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
    Mail,
    LineChart
} from "lucide-react";
import { AdminLogoutButton } from "./AdminLogoutButton";

export function AdminSidebar() {
    return (
        <aside className="w-64 bg-[var(--ag-sys-color-surface)] border-r border-[var(--ag-sys-color-border)] flex flex-col sticky top-0 h-screen overflow-y-auto">
            <nav className="flex-1 p-4 space-y-2">
                <AdminNavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
                <AdminNavLink href="/admin/insights" icon={<LineChart className="w-5 h-5" />} label="Insights" />
                <AdminNavLink href="/admin/users" icon={<Users className="w-5 h-5" />} label="Usuarios" />
                <AdminNavLink href="/admin/listings" icon={<Package className="w-5 h-5" />} label="Anuncios" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Marketing</p>
                </div>
                <AdminNavLink href="/admin/marketing/social" icon={<Share2 className="w-5 h-5" />} label="Social Media" />
                <AdminNavLink href="/admin/marketing/cms" icon={<FileText className="w-5 h-5" />} label="CMS" />
                <AdminNavLink href="/admin/marketing/email" icon={<Mail className="w-5 h-5" />} label="Email marketing" />
                <AdminNavLink href="/admin/marketing/ghost" icon={<Package className="w-5 h-5" />} label="Empresas ghost" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-[10px] font-bold text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Sistema</p>
                </div>
                <AdminNavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Configuración" />
                <AdminNavLink href="/admin/lonjas" icon={<DownloadCloud className="w-5 h-5" />} label="Lonjas ETL" />
            </nav>
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
