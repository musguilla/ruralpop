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
import Image from "next/image";
import { formatRelativeTime } from "@/utils/format";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: users, error } = await supabase
        .from("users")
        .select("*")
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
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold rounded-xl hover:bg-[var(--ag-sys-color-background)] transition-all flex items-center gap-2">
                        Descargar CSV
                    </button>
                    <button className="px-6 py-3 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--ag-sys-color-primary)]/20">
                        Exportar Auditoría
                    </button>
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
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Registro</th>
                            <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--ag-sys-color-border)] text-sm">
                        {users?.map((u: any) => (
                            <tr key={u.id} className="hover:bg-[var(--ag-sys-color-background)]/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-11 h-11 rounded-xl bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] overflow-hidden flex-shrink-0">
                                            {u.avatar_url ? (
                                                <Image src={u.avatar_url} alt={u.name || ''} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--ag-sys-color-primary)] font-bold text-lg">
                                                    {u.name?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--ag-sys-color-text)] leading-tight">{u.name || 'Sin nombre'}</p>
                                            <span className="text-xs text-[var(--ag-sys-color-text-muted)]">{u.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-[var(--ag-sys-color-text-muted)] font-medium">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {u.location || 'No definida'}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-[var(--ag-sys-color-text-muted)] font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatRelativeTime(u.created_at)}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                                        <button className="p-2.5 text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-background)] rounded-xl transition-all" title="Editar Rol">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Banear Usuario">
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
