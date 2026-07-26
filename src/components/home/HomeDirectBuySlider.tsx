import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { type Listing } from "@/components/ui/ListingCard";
import { ListingSlider } from "@/components/ui/ListingSlider";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString, getServerTenantSlug } from "@/utils/tenant/server";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleCode } from "@/i18n/config";

export async function HomeDirectBuySlider() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();
    
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const t = await getDictionary(locale);

    // 1. Obtener todos los user_id que tienen el monedero 100% configurado en Stripe
    // Usamos el cliente admin de supabase para saltar el RLS de professional_wallets si está capado por user.
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: wallets, error: walletError } = await supabaseAdmin
        .from('professional_wallets')
        .select('user_id')
        .not('stripe_connected_account_id', 'is', null);

    if (walletError || !wallets || wallets.length === 0) {
        return null;
    }

    const validUserIds = wallets.map(w => w.user_id);

    const tenant = await getServerTenantSlug();

    // 2. Traer los anuncios activos, no ghost, con venta_online = true de estos vendedores (o todos si es Equipop)
    let query = supabase
        .from("listings")
        .select(`
            id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .in("user_id", validUserIds)
        .order("created_at", { ascending: false })
        .limit(10); // Traemos 10 para hacer un buen slider

    if (tenant !== 'equipop') {
        query = query.eq("vender_online", true);
    }

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching direct buy listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    const userFavs = await getUserFavoriteIds();

    return (
        <ListingSlider 
            title={t.home.direct_buy}
            listings={listings as Listing[]}
            userFavs={userFavs}
        />
    );
}
