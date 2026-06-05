import { createClient } from "@/utils/supabase/server";
import { UserRow } from "./UserRow";
import { SearchUsers } from "./SearchUsers";
import { Pagination } from "@/components/ui/Pagination";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminUsersPage(props: Props) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const tenant = await getServerTenantSlug();
    
    const page = parseInt(searchParams.page as string) || 1;
    const limit = 100;
    const search = searchParams.search as string || "";

    let query = supabase
        .from("users")
        .select("*, listings(count)", { count: "exact" });

    const tenantId = tenant ? TENANTS_CONFIG[tenant]?.id : null;
    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,contact_phone.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error("Error fetching users:", error);
    }

    const totalPages = count ? Math.ceil(count / limit) : 1;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">
                        Control de roles, permisos y estado de cuentas. {count ? `(${count} usuarios)` : ''}
                    </p>
                </div>
                <div className="w-full sm:w-auto self-end">
                    <SearchUsers />
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
                        {users?.map((u: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            const adsCount = u.listings?.[0]?.count || 0;
                            return <UserRow key={u.id} user={u} adsCount={adsCount} />;
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={page} totalPages={totalPages} />
        </div>
    );
}
