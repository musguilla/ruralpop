import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search, User } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verificar rol admin
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen w-full bg-[var(--ag-sys-color-background)]">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-20 bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ag-sys-color-text-muted)]">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar usuarios, anuncios..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 text-[var(--ag-sys-color-text-muted)] hover:bg-[var(--ag-sys-color-background)] rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-[var(--ag-sys-color-surface)] rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-[var(--ag-sys-color-border)]">
                            <div className="text-right">
                                <p className="text-sm font-bold text-[var(--ag-sys-color-text)] leading-none">{user.user_metadata?.name || 'Admin'}</p>
                                <span className="text-[10px] font-bold text-[var(--ag-sys-color-primary)] uppercase tracking-wider">Super Administrador</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[var(--ag-sys-color-primary)] text-white flex items-center justify-center font-bold">
                                {user.user_metadata?.name?.[0] || <User className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
