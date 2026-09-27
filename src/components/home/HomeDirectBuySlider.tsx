import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { type Listing } from "@/components/ui/ListingCard";
import { ListingSlider } from "@/components/ui/ListingSlider";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString, getServerTenantSlug } from "@/utils/tenant/server";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleCode } from "@/i18n/config";

// --- INTERFACES ---
interface DirectBuyListingRecord extends Listing {
    user_id: string;
}

/**
 * Valida que un anuncio contenga al menos una URL de imagen no vacía.
 * @param listing Objeto de anuncio con propiedad image_urls.
 * @returns boolean indicando si el anuncio dispone de una imagen válida.
 */
function hasValidImage(listing: DirectBuyListingRecord): boolean {
    if (!listing.image_urls || !Array.isArray(listing.image_urls) || listing.image_urls.length === 0) {
        return false;
    }
    return listing.image_urls.some((url: unknown) => typeof url === 'string' && url.trim().length > 0);
}

/**
 * Intercala anuncios en round-robin agrupando por vendedor (user_id).
 *
 * Objetivo:
 * - Los primeros puestos del carrusel se reparten equitativamente entre distintos vendedores.
 * - Si un vendedor tiene varios productos y otros vendedores ya no tienen más, los productos restantes
 *   se incorporan al final de la cola.
 *
 * Impacto en rendimiento: O(N) tiempo y memoria para N <= 80 candidatos en el servidor (ejecución < 1ms).
 *
 * @param listings Array de anuncios con fotos válidas ordenados por fecha de creación descendente.
 * @returns Array de anuncios intercalados con distribución justa entre vendedores.
 */
function interleaveListingsByUser(listings: DirectBuyListingRecord[]): DirectBuyListingRecord[] {
    const userBuckets = new Map<string, DirectBuyListingRecord[]>();

    for (const item of listings) {
        const uid = item.user_id;
        const bucket = userBuckets.get(uid);
        if (bucket) {
            bucket.push(item);
        } else {
            userBuckets.set(uid, [item]);
        }
    }

    const queues = Array.from(userBuckets.values());
    const result: DirectBuyListingRecord[] = [];
    let hasRemaining = true;
    let round = 0;

    while (hasRemaining) {
        hasRemaining = false;
        for (const queue of queues) {
            if (round < queue.length) {
                result.push(queue[round]);
                hasRemaining = true;
            }
        }
        round++;
    }

    return result;
}

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

    // 2. Traer un lote enriquecido de anuncios activos con venta directa (hasta 80 para poder diversificar vendedores)
    let query = supabase
        .from("listings")
        .select(`
            id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured, user_id,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .in("user_id", validUserIds)
        .order("created_at", { ascending: false })
        .limit(80);

    if (tenant !== 'equipop') {
        query = query.eq("vender_online", true);
    }

    // Filtro asimétrico de país (España / Portugal)
    if (locale !== 'pt') {
        query = query.or(`and(or(province_id.lt.100,province_id.is.null),or(${tenantFilterString}))`);
    } else {
        query = query.gte("province_id", 100).or(tenantFilterString);
    }

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching direct buy listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    // 3. Filtrar anuncios sin foto
    const listingsWithImages = (listings as unknown as DirectBuyListingRecord[]).filter(hasValidImage);

    if (listingsWithImages.length === 0) {
        return null;
    }

    // 4. Intercalar anuncios por vendedor (round-robin) para evitar monopolio de un solo vendedor
    const interleavedListings = interleaveListingsByUser(listingsWithImages);

    // Limitamos a 16 elementos para el carrusel de inicio
    const finalListings = interleavedListings.slice(0, 16);

    const userFavs = await getUserFavoriteIds();

    return (
        <ListingSlider 
            title={t.home.direct_buy}
            listings={finalListings as Listing[]}
            userFavs={userFavs}
        />
    );
}

/**
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISIONS & EDGE CASES:
 * 
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Inicialmente la consulta SQL limitaba a 10 elementos por orden cronológico estricto.
 *      Esto causaba que si un único usuario (ej. CuniMar) publicaba varios productos seguidos,
 *      acaparaba todos los primeros puestos del carrusel, y además aparecían productos sin imagen ("Sin imagen").
 *    - Se amplió la muestra a 80 registros para capturar múltiples vendedores con venta directa activa.
 *    - Se descartaron en memoria todos los anuncios sin imagen o con arrays vacíos/nulos (`hasValidImage`).
 *    - Se implementó un algoritmo determinista round-robin que garantiza máxima variedad de usuarios
 *      en los primeros slides del slider, colocando los productos secundarios de los mismos usuarios
 *      al final del slider si no existen más vendedores disponibles.
 * 
 * 2. Posibles edge cases cubiertos:
 *    - Anuncios con `image_urls` nulo, indefinido, array vacío o strings vacíos `[""]`: descartados con `hasValidImage`.
 *    - Vendedores con diferente número de anuncios (ej. vendedor A con 10, vendedor B con 1): el algoritmo
 *      ronda a ronda extrae 1 de cada uno; cuando el vendedor B se agota, el algoritmo continúa sin errores
 *      con los siguientes de A al final.
 *    - Un solo vendedor activo en toda la plataforma: se muestran sus anuncios ordenados cronológicamente sin fallos.
 *    - Cero anuncios con foto: se devuelve `null` sin renderizar un slider vacío.
 */
