import { createClient } from "@supabase/supabase-js";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { EscrowOrdersClient, EscrowOrderRecordFull } from "./EscrowOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminEscrowPage() {
    const tenant = (await getServerTenantSlug()) || "ruralpop";

    // Server-side fetch with Supabase Admin client to ensure full visibility for admin
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: ordersData, error } = await adminClient
        .from("escrow_orders")
        .select(`
            id,
            listing_id,
            buyer_id,
            seller_id,
            seller_email,
            gross_amount_cents,
            ruralpop_fee_cents,
            seller_net_amount_cents,
            currency,
            status,
            stripe_checkout_session_id,
            stripe_payment_intent_id,
            stripe_charge_id,
            stripe_transfer_id,
            stripe_connected_account_id,
            buyer_confirmed_at,
            seller_paid_at,
            cancelled_at,
            refunded_at,
            dispute_opened_at,
            created_at,
            updated_at,
            tenant_id,
            listing:listings(id, title, price, image_urls, location, tenant_id),
            buyer:users!escrow_orders_buyer_id_fkey(id, email, name, commercial_name, contact_phone),
            seller:users!escrow_orders_seller_id_fkey(id, email, name, commercial_name, contact_phone)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching admin escrow orders:", error);
    }

    const orders = (ordersData || []) as unknown as EscrowOrderRecordFull[];

    return (
        <EscrowOrdersClient 
            orders={orders} 
            currentTenant={tenant} 
        />
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de auditoría y detalle de operaciones de Escrow (Pagos Seguros) accesible desde la lupa de los widgets
 *   de "Ventas Escrow" y "Comisiones Escrow" en el panel administrativo.
 * - Utiliza el cliente administrativo de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) para garantizar que el admin
 *   pueda inspeccionar los datos completos de comprador, vendedor, anuncios y transacciones con cero bloqueos de RLS.
 * - Carga completa con ordenación temporal descendente para alimentar al componente de cliente con filtrado instantáneo.
 * - Compatible con multi-tenant (Ruralpop / Equipop), adaptando los filtros y enlaces de forma dinámica.
 */
