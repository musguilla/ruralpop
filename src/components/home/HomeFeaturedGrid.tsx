import React from 'react';
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleCode } from "@/i18n/config";
import { createClient } from "@/utils/supabase/server";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { getUserFavoriteIds } from "@/app/favoritos/actions";
import { getServerTenantFilterString, getServerTenantSlug } from "@/utils/tenant/server";
import Link from 'next/link';
import Image from 'next/image';
import { AdSenseInFeed } from '@/components/ads/AdSenseInFeed';
import { Star } from 'lucide-react';

// Static banners definitions
const STATIC_BANNERS = [
    {
        id: 'cunimar',
        href: 'https://cunimar.com/comida-y-productos-secos-conejos/',
        src: '/cunimar-banner-800x800@2x.jpg',
        alt: 'Cunimar - Comida y productos secos para conejos'
    },
    {
        id: 'masdelbrunet',
        href: 'https://masdelbrunet.cat/',
        src: '/masdelbrunet-banner-800x800.jpg',
        alt: 'Mas del Brunet'
    },
    {
        id: 'semillas',
        href: 'https://www.ruralpop.com/empresa/semillas',
        src: '/semillass-banner-800x800.jpg',
        alt: 'Semillas'
    }
];

export async function HomeFeaturedGrid() {
    const supabase = await createClient();
    const tenantFilterString = await getServerTenantFilterString();
    const tenant = await getServerTenantSlug();
    
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const t = await getDictionary(locale);

    // Fetch featured listings, ordered by featured_until DESC (most recently featured first)
    let query = supabase
        .from("listings")
        .select(`
            id, title, title_pt, description_pt, price, location, image_urls, created_at, category, price_type, is_featured,
            users!inner(is_ghost)
        `)
        .eq("status", "active")
        .eq("is_featured", true)
        .eq("users.is_ghost", false)
        .order("created_at", { ascending: false })
        .limit(12);

    
    
    // Asymmetric Country filter (ROBUST PostgREST syntax)
    if (locale !== 'pt') {
        query = query.or(`and(or(province_id.lt.100,province_id.is.null),or(${tenantFilterString}))`);
    } else {
        query = query.or(tenantFilterString);
    }
    

    const { data: listings, error } = await query;

    if (error) {
        console.error("Error fetching featured listings:", error);
        return null;
    }

    if (!listings || listings.length === 0) {
        return null;
    }

    const userFavs = await getUserFavoriteIds();

    // Prepare grid items array
    // 1. Featured Listings
    const gridItems = listings.map((listing: any) => ({
        type: 'listing',
        id: listing.id,
        data: listing as Listing
    }));

    // 2. Append Static Banners (only for ruralpop, not equipop)
    if (tenant !== 'equipop') {
        STATIC_BANNERS.forEach(banner => {
            gridItems.push({
                type: 'banner',
                id: banner.id,
                data: banner
            });
        });
    }

    // 3. Pad with AdSense to make the grid a multiple of 4
    const remainder = gridItems.length % 4;
    if (remainder !== 0) {
        const adsNeeded = 4 - remainder;
        for (let i = 0; i < adsNeeded; i++) {
            gridItems.push({
                type: 'ad',
                id: `ad-padding-${i}`,
                data: null
            });
        }
    }

    return (
        <section className="my-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--ag-sys-color-text)] flex items-center justify-center sm:justify-start gap-2">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFB800] fill-[#FFB800]" />
                    {t.home.featured}
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {gridItems.map((item: any) => {
                    if (item.type === 'listing') {
                        return (
                            <ListingCard 
                                key={item.id}
                                listing={item.data as Listing} 
                                isFavorited={userFavs.includes(item.id)} 
                            />
                        );
                    }
                    
                    if (item.type === 'banner') {
                        const banner = item.data;
                        const isExternal = banner.href.startsWith('http');
                        return (
                            <Link 
                                key={item.id}
                                href={banner.href} 
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="block relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--ag-sys-color-border)]"
                            >
                                <Image 
                                    src={banner.src} 
                                    alt={banner.alt}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </Link>
                        );
                    }

                    if (item.type === 'ad') {
                        return (
                            <div key={item.id} className="block relative aspect-square">
                                <AdSenseInFeed />
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
            
            {/* Memory / Decisiones Técnicas:
                * - Se ha refactorizado el slider a un Grid puro que unifica anuncios destacados, banners estáticos y Adsense.
                * - Se asegura que la cuadrícula siempre termine en un múltiplo de 4 para no dejar huecos usando Ads de relleno.
                * - Se ordena por 'featured_until' DESC para que los últimos destacados pagados salgan los primeros.
            */}
        </section>
    );
}
