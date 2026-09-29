export const dynamic = "force-dynamic";
import { createClient } from "@/utils/supabase/server";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { Suspense } from "react";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { HomeSearchHero } from "@/components/ui/HomeSearchHero";
import { EquipopHomeSearchHero } from "@/components/ui/EquipopHomeSearchHero";
import { getServerTenantSlug, getServerTenantDomain } from "@/utils/tenant/server";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { HomeLatestListings } from "@/components/home/HomeLatestListings";
import { HomeDirectBuySlider } from "@/components/home/HomeDirectBuySlider";
import { HomeFeaturedGrid } from "@/components/home/HomeFeaturedGrid";
import { AppBanner } from "@/components/home/AppBanner";
import { HomePopularListings } from "@/components/home/HomePopularListings";
import { Metadata } from "next";
import { generateSeoH1 } from "@/utils/h1Generator";
import { LOCATIONS } from "@/constants/locations";

import { headers } from "next/headers";
import { getHreflangLinks, getCanonicalUrl } from "@/i18n/utils";
import { LocaleCode } from "@/i18n/config";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const headersList = await headers();
  const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
  const originalPathname = headersList.get('x-original-pathname') || '/';
  const tenant = await getServerTenantSlug();
  const currentDomain = await getServerTenantDomain();
  const isEquipop = tenant === 'equipop' || currentDomain.includes('equipop');

  let canonical = getCanonicalUrl(originalPathname, locale, currentDomain);
  if (searchParams.page && typeof searchParams.page === 'string' && searchParams.page !== '1') {
      canonical += `?page=${searchParams.page}`;
  }

  const isPt = locale === 'pt';
  const title = isEquipop 
    ? (isPt ? "Equipop - Vende e compra material equestre em segunda mão" : "Equipop - Vende y compra material hípico segunda mano")
    : (isPt ? "Ruralpop - App grátis para comprar e vender gado" : "Ruralpop - App gratis para comprar y vender ganado");

  const description = isEquipop
    ? (isPt ? "App grátis para vender, comprar e pesquisar material e equipamentos equestres." : "App gratis para vender, comprar y buscar material y equipamientos hípicos.")
    : (isPt ? "App móvel grátis para pesquisar, vender e comprar gado, máquinas, alimentação, forragem e encontrar serviços profissionais. Vacas, cavalos, ovelhas, cabras, galinhas ... de agricultores para agricultores." : "App móvil gratis para buscar, vender y comprar ganado, maquinaria, alimentación, forraje y encontrar servicios profesionales. Vacas, caballos, ovejas, cabras, gallinas ... de ganaderos para ganaderos.");

  return {
    alternates: {
      canonical,
      languages: getHreflangLinks(originalPathname, currentDomain),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: isEquipop ? "Equipop" : "Ruralpop",
      images: [
        {
          url: isEquipop ? `${currentDomain}/equipop-logo.png` : '/opengraph-image.png',
          width: 512,
          height: 512,
        }
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [isEquipop ? `${currentDomain}/equipop-logo.png` : '/opengraph-image.png'],
    },
    itunes: {
      appId: isEquipop ? "6778118647" : "6759678666"
    }
  };
}

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const headersList = await headers();
  const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
  const tenant = await getServerTenantSlug();

  const parsedSlug = {
    q: searchParams.q as string | undefined,
    category: searchParams.category as string | undefined,
    subcategory: searchParams.subcategory as string | undefined
  };

  let locationName = "";
  if (searchParams.province_id) {
    const loc = LOCATIONS.find(l => l.id === searchParams.province_id);
    if (loc) locationName = loc.name;
  }

  // Pasamos los searchParams como Server Component prop.
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">

      {/* Conditionally render Search Hero or Active Search Bar */}
      {Object.keys(searchParams).length === 0 ? (
        tenant === 'equipop' ? <EquipopHomeSearchHero /> : <HomeSearchHero />
      ) : (
        <>
          <h1 className="text-lg md:text-xl font-bold text-[var(--ag-sys-color-text)] mb-2 pt-2 sm:pt-0">
            {generateSeoH1(parsedSlug, locationName, locale, tenant)}
          </h1>
          <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
            <ActiveSearchBar />
          </Suspense>
        </>
      )}

      {/* Render Dynamic Homepage Sections vs Search Results */}
      {Object.keys(searchParams).length === 0 ? (
          <>
              <Suspense fallback={<GridSkeleton />}>
                  <HomeLatestListings />
              </Suspense>

              {tenant !== 'equipop' && (
                  <Suspense fallback={null}>
                      <HomeDirectBuySlider />
                  </Suspense>
              )}

              <Suspense fallback={null}>
                  <AppBanner />
              </Suspense>

              <Suspense fallback={null}>
                  <HomeFeaturedGrid />
              </Suspense>

              <Suspense fallback={<GridSkeleton />}>
                  <HomePopularListings />
              </Suspense>
          </>
      ) : (
          <Suspense fallback={<GridSkeleton />}>
              <ListingsGrid searchParams={searchParams} isHome={true} />
          </Suspense>
      )}

    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Next.js App Router (SSR): Home pre-renderiza Grid Skeleton en lo que resuelve el DB Fetch.
 * - 'q' search param está pensado para enlazarse en el Header (SearchInput)
 * - `Suspense` wraps `ListingsGrid` making it extremely fast, initial HTML layout gets delivered instantly.
 * - ListingsGrid se ha extraido a su propio componente para ser reutilizado en `[slug]/page.tsx`.
 * - H1 dinámico por tenant: se inyecta `tenant` a `generateSeoH1` para mostrar 'Anuncios material hípico' en Equipop (ej. al ver todos con `?sort=recent`) y 'Anuncios clasificados del mundo rural' en Ruralpop.
 */

