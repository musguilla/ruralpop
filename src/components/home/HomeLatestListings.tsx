import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString, getServerTenantSlug } from "@/utils/tenant/server";
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
    
    // Asymmetric Country filter builder
    const applyCountryFilter = (q: any) => {
        if (locale !== 'pt') {
            return q.or(`and(or(province_id.lt.100,province_id.is.null),or(${tenantFilterString}))`);
        } else {
            return q.gte("province_id", 100).or(tenantFilterString);
        }
    };

    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    let listings: any[] = [];
    let error = null;

    if (isEquipop) {
        let query = supabase
            .from("listings")
            .select(`
                id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
                users!inner(is_ghost)
            `)
            .eq("status", "active")
            .eq("users.is_ghost", false)
            .neq("image_urls", "{}")
            .order("created_at", { ascending: false })
            .limit(locale === 'pt' ? 24 : 12);
            
        query = applyCountryFilter(query);
        const { data, error: qError } = await query;
        error = qError;
        listings = data || [];
    } else {
        const limitPerCategory = 6;
        const subcategoriesToMix = ['Equino', 'Ovino', 'Caprino', 'Bovino'];
        
        const queries = subcategoriesToMix.map(subcat => {
            let q = supabase
                .from("listings")
                .select(`
                    id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
                    users!inner(is_ghost)
                `)
                .eq("status", "active")
                .eq("users.is_ghost", false)
                .neq("image_urls", "{}")
                .ilike("subcategory", subcat)
                .order("created_at", { ascending: false })
                .limit(limitPerCategory);
            return applyCountryFilter(q);
        });

        // Ensure we exclude both capitalized and lowercase versions for the 'others' category
        const excludedSubcats = subcategoriesToMix.flatMap(s => [s, s.toLowerCase()]);

        let qOthers = supabase
            .from("listings")
            .select(`
                id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
                users!inner(is_ghost)
            `)
            .eq("status", "active")
            .eq("users.is_ghost", false)
            .neq("image_urls", "{}")
            .not("subcategory", "in", `(${excludedSubcats.join(',')})`)
            .order("created_at", { ascending: false })
            .limit(limitPerCategory);
            
        queries.push(applyCountryFilter(qOthers));

        const results = await Promise.all(queries);
        
        // Verifica si hubo algún error en las peticiones
        const err = results.find(r => r.error);
        if (err) {
            error = err.error;
        } else {
            // Interleave
            const mixedListings = [];
            for (let i = 0; i < limitPerCategory; i++) {
                for (let j = 0; j < results.length; j++) {
                    if (results[j].data && results[j].data[i]) {
                        mixedListings.push(results[j].data[i]);
                    }
                }
            }
            listings = mixedListings.slice(0, 24); // Cap to 24 (6 rows of 4)
        }
    }

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
