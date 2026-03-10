import { createClient } from "@/utils/supabase/server";
import {
    Search,
    MoreHorizontal,
    Edit2,
    Shield,
    UserX,
    UserCheck,
    MapPin,
    Calendar
} from "lucide-react";
import { formatRelativeTime } from "@/utils/format";
import { UserRow } from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: users, error } = await supabase
        .from("users")
        .select("*, listings(count)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">Control de roles, permisos y estado de cuentas.</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--ag-sys-color-background)]/50 border-b border-[var(--ag-sys-color-border)]">
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Usuario</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Ubicación</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Rol</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Anuncios</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Registro</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--ag-sys-color-border)] text-sm">
                        {users?.map((u: any) => {
                            const adsCount = u.listings?.[0]?.count || 0;
                            return <UserRow key={u.id} user={u} adsCount={adsCount} />;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
