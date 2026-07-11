import { createClient } from "@/utils/supabase/server";
import { GhostCompaniesTable } from "./GhostCompaniesTable";

export const dynamic = "force-dynamic";

export default async function AdminGhostCompaniesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    // Get admin's tenant_id to isolate the view
    let tenantId = null;
    if (user) {
        const { data: adminProfile } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single();
        tenantId = adminProfile?.tenant_id || null;
    }

    // Fetch ghost companies for the current tenant
    let query = supabase
        .from('users')
        .select('id, commercial_name, ghost_token, company_logo_url, created_at, avatar_url, email')
        .or('is_ghost.eq.true,and(ghost_token.not.is.null,email.ilike.%ghost%)')
        .order('created_at', { ascending: false });

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    } else {
        query = query.is('tenant_id', null);
    }

    const { data: ghosts, error } = await query;

    if (error) {
        console.error("Error fetching ghost companies:", error);
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
                    Empresas Ghost
                </h1>
                <p className="text-[var(--ag-sys-color-text-muted)] mt-2">
                    Visualiza y gestiona las empresas fantasma. Envía invitaciones por correo electrónico a sus responsables.
                </p>
            </header>

            <div className="bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <GhostCompaniesTable companies={ghosts || []} />
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Construimos la página como Server Component para hacer fetch directo de BBDD.
 * - Le pasamos los datos a GhostCompaniesTable (Client Component) para gestionar estados interactivos (selección de emails y estado de envío).
 */
