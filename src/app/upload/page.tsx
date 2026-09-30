import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import UploadForm from "./UploadForm";
import { getStripe } from "@/lib/stripe";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { getTenantConfig, getRuralpopDatabaseId } from "@/config/tenants";
import { getLoginRedirectUrl } from "@/utils/authRedirect";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
    const tenant = await getServerTenantSlug();
    const supabase = await createClient();
    const headersList = await headers();
    const locale = headersList.get('x-locale') || 'es';
    const originalPathname = headersList.get('x-original-pathname') || (locale === 'pt' ? '/pt/upload' : '/upload');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(getLoginRedirectUrl(locale, originalPathname));
    }

    // Fetch user profile to get saved phone
    const { data: profile } = await supabase
        .from("users")
        .select("contact_phone, is_ghost, role, nif, zoo_register_number, name, province_id, municipality_id")
        .eq("id", user.id)
        .single();

    if (profile?.is_ghost) {
        redirect(locale === 'pt' ? "/pt/profesionales?ghost_claim=true" : "/profesionales?ghost_claim=true");
    }

    const savedPhone = profile?.contact_phone ?? null;

    // Determine country from locale
    const targetCountry = locale === 'pt' ? 'PT' : 'ES';

    // Fetch provinces to feed the first selector
    const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name")
        .eq("country_id", targetCountry)
        .order("name");

    const initialProvinces = provinces || [];

    // Fetch Wallet to check Stripe readiness
    const { data: wallet } = await supabase
        .from("professional_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

    let isStripeReady = false;
    if (wallet?.stripe_connected_account_id) {
        try {
            const stripe = getStripe(tenant);
            const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
            isStripeReady = account.charges_enabled && account.details_submitted;
        } catch (e) {
            console.error("Error retrieving Stripe account:", e);
        }
    }

    const isProfesional = profile?.role === 'profesional';
    const userProfile = {
        name: profile?.name || "",
        nif: profile?.nif || "",
        zoo_register_number: profile?.zoo_register_number || "",
        province_id: profile?.province_id || null,
        municipality_id: profile?.municipality_id || null
    };

    const tenantSlug = await getServerTenantSlug();
    const activeTenantId = tenantSlug ? getTenantConfig(tenantSlug).id : getRuralpopDatabaseId();

    return <UploadForm savedPhone={savedPhone} initialProvinces={initialProvinces} userEmail={user.email} hasWalletConfigured={isStripeReady} isProfesional={isProfesional} userProfile={userProfile} activeTenantId={activeTenantId || undefined} isEquipop={tenantSlug === 'equipop'} />;
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Preservación de Locale en /pt/upload: Si un usuario no autenticado entra a publicar
 *      desde Portugal, se utiliza `getLoginRedirectUrl(locale, originalPathname)` para
 *      llevarlo a `/pt/login?redirectTo=%2Fpt%2Fupload` en vez de enviarlo a la raíz española.
 *    - Discriminación de distritos: Al alimentar `initialProvinces` según `targetCountry`,
 *      en Portugal (/pt) se entregan los 18 distritos (IDs 101-118) y en España las 52 provincias.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Headers ausentes o SSR sin sesión: fallback a 'es' y '/upload'.
 *    - Perfil ghost redirigido preservando el prefijo '/pt'.
 * -----------------------------------------------------------------------------
 */
