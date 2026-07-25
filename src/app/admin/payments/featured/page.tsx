import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { TENANTS_CONFIG } from "@/config/tenants";
import Link from "next/link";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";

export const dynamic = "force-dynamic";

export default async function FeaturedPaymentsPage() {
    const supabase = await createClient();
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const equipopId = isEquipop ? TENANTS_CONFIG[tenant]?.id : null;

    // Fetch real revenue data from Stripe
    const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 100 });
    let successfulPayments = paymentIntentsResponse.data.filter(pi => 
        pi.status === "succeeded" && pi.metadata?.listingId
    );
    
    // Filter by tenant if equipop
    let validListingIds = new Set<string>();
    if (isEquipop && successfulPayments.length > 0) {
        const listingIds = successfulPayments.map(pi => pi.metadata?.listingId).filter(Boolean);
        const { data: listingsData } = await supabase.from('listings').select('id').eq('tenant_id', equipopId).in('id', listingIds);
        validListingIds = new Set(listingsData?.map((l: any) => l.id) || []);
        successfulPayments = successfulPayments.filter(pi => validListingIds.has(pi.metadata?.listingId));
    } else {
        const listingIds = successfulPayments.map(pi => pi.metadata?.listingId).filter(Boolean);
        const { data: listingsData } = await supabase.from('listings').select('id').in('id', listingIds);
        validListingIds = new Set(listingsData?.map((l: any) => l.id) || []);
    }

    // Now fetch details of listings and users
    const allListingIds = Array.from(validListingIds);
    const allUserIds = Array.from(new Set(successfulPayments.map(pi => pi.metadata?.userId).filter(Boolean)));

    const [{ data: listingsData }, { data: usersData }] = await Promise.all([
        supabase.from('listings').select('id, title').in('id', allListingIds),
        supabase.from('users').select('id, email, name, commercial_name').in('id', allUserIds)
    ]);

    const listingsMap = new Map<string, any>(listingsData?.map((l: any) => [l.id, l]) || []);
    const usersMap = new Map<string, any>(usersData?.map((u: any) => [u.id, u]) || []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--ag-sys-color-text)] tracking-tight">Pagos Recibidos</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)] mt-1">
                        Detalle de anuncios destacados y verificaciones ({successfulPayments.length} pagos)
                    </p>
                </div>
                <Link 
                    href="/admin"
                    className="px-4 py-2 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-full text-sm font-bold hover:bg-[var(--ag-sys-color-background)] transition-colors"
                >
                    Volver al Dashboard
                </Link>
            </div>

            <div className="bg-[var(--ag-sys-color-surface)] rounded-[2rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--ag-sys-color-background)]/50 border-b border-[var(--ag-sys-color-border)]">
                                <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Anuncio</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest">Plan / Producto</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--ag-sys-color-text-muted)] uppercase tracking-widest text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--ag-sys-color-border)] text-sm">
                            {successfulPayments.map((pi) => {
                                const listing = listingsMap.get(pi.metadata?.listingId);
                                const user = usersMap.get(pi.metadata?.userId) || usersMap.get(pi.customer as string);
                                
                                const planId = pi.metadata?.planId || "Desconocido";
                                let planName = planId;
                                if (planId === "bump") planName = "Subir Anuncio";
                                else if (planId.startsWith("highlight")) planName = `Destacar (${planId.split('_')[1]} días)`;
                                else if (planId === "animal_welfare_validation") planName = "Bienestar Animal PRO";
                                else if (planId === "profile_validation") planName = "Perfil Verificado PRO";

                                const amount = (pi.amount / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
                                const date = new Date(pi.created * 1000);

                                return (
                                    <tr key={pi.id} className="hover:bg-[var(--ag-sys-color-background)]/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-[var(--ag-sys-color-text-muted)]">
                                            {date.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[var(--ag-sys-color-text)]">{user.commercial_name || user.name || "Sin nombre"}</span>
                                                    <span className="text-xs text-[var(--ag-sys-color-text-muted)]">{user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[var(--ag-sys-color-text-muted)]">Desconocido</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {listing ? (
                                                <Link href={`/anuncio/${slugify(listing.title || 'anuncio')}-${encodeId(listing.id)}`} target="_blank" className="font-bold text-[var(--ag-sys-color-primary)] hover:underline">
                                                    {listing.title}
                                                </Link>
                                            ) : (
                                                <span className="text-[var(--ag-sys-color-text-muted)]">Anuncio eliminado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 whitespace-nowrap">
                                                {planName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[var(--ag-sys-color-text)]">
                                            {amount}
                                        </td>
                                    </tr>
                                );
                            })}
                            {successfulPayments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--ag-sys-color-text-muted)] font-bold text-lg">
                                        No hay pagos registrados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
