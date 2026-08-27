import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString } from "@/utils/tenant/server";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleCode } from "@/i18n/config";

export async function HomeLatestListings() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();
    
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const t = await getDictionary(locale);
    
    // Fetch latest active listings that have images
    let query = supabase
        .from("listings")
        .select(`
            id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("users.is_ghost", false)
        .neq("image_urls", "{}") // Only listings with photos
        .order("created_at", { ascending: false })
        .limit(12);

    
    // Asymmetric Country filter: Spain MUST NOT see Portugal ads.
    if (locale !== 'pt') {
        query = query.or("province_id.lt.100,province_id.is.null");
    }

    query = query.or(tenantFilterString);

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching latest listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null; // Silent skip if empty
    }

    const userFavs = await getUserFavoriteIds();

    return (
        <section className="my-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center justify-center sm:justify-start gap-2">
                    {t.home.latest_listings}
                </h2>
                <div className="hidden sm:flex justify-end w-auto">
                    <LocalizedLink 
                        href="/?sort=recent" 
                        className="inline-flex items-center justify-center gap-2 px-12 py-2.5 bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] rounded-full font-bold text-base transition-all shadow-md w-auto min-w-[200px]"
                    >
                        <span className="truncate">{t.home.see_all}</span>
                        <ArrowRight className="w-5 h-5 flex-shrink-0" />
                    </LocalizedLink>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {listings.map((listing: any) => (
                    <ListingCard 
                        key={listing.id}
                        listing={listing as Listing} 
                        isFavorited={userFavs.includes(listing.id)} 
                    />
                ))}
            </div>

            <div className="flex sm:hidden justify-center w-full mt-6">
                <LocalizedLink 
                    href="/?sort=recent" 
                    className="inline-flex items-center justify-center gap-2 px-12 py-2.5 bg-[var(--ag-sys-color-primary)] text-white hover:bg-[var(--ag-sys-color-primary-hover)] rounded-full font-bold text-base transition-all shadow-md w-full"
                >
                    <span className="truncate">{t.home.see_all}</span>
                    <ArrowRight className="w-5 h-5 flex-shrink-0" />
                </LocalizedLink>
            </div>

            {/* Documentación de memoria */}
            {/*
                * Decisiones Técnicas:
                * - Server component puro para SSR pre-renderizado del bloque de últimos anuncios.
                * - Se aplica un hard limit de 8 elementos de BD, filtrando "image_urls" para garantizar solo anuncios con fotos.
            */}
        </section>
    );
}
