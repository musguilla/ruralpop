import { createClient } from "@/utils/supabase/server";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { Suspense } from "react";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { HomeSearchHero } from "@/components/ui/HomeSearchHero";
import { EquipopHomeSearchHero } from "@/components/ui/EquipopHomeSearchHero";
import { getServerTenantSlug } from "@/utils/tenant/server";
import { ListingsGrid } from "@/components/ui/ListingsGrid";
import { HomeLatestListings } from "@/components/home/HomeLatestListings";
import { HomeDirectBuySlider } from "@/components/home/HomeDirectBuySlider";
import { HomeFeaturedSlider } from "@/components/home/HomeFeaturedSlider";
import { HomePopularListings } from "@/components/home/HomePopularListings";
import { HomeStoreSection } from "@/components/store/HomeStoreSection";
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

  let canonical = getCanonicalUrl(originalPathname, locale);
  if (searchParams.page && typeof searchParams.page === 'string' && searchParams.page !== '1') {
      canonical += `?page=${searchParams.page}`;
  }

  return {
    alternates: {
      canonical,
      languages: getHreflangLinks(originalPathname),
    },
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
            {generateSeoH1(parsedSlug, locationName, locale)}
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

              <Suspense fallback={null}>
                  <HomeDirectBuySlider />
              </Suspense>

              <Suspense fallback={null}>
                  <HomeFeaturedSlider />
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

      {/* Store Section */}
      {tenant !== 'equipop' && (
        <Suspense fallback={null}>
          <HomeStoreSection />
        </Suspense>
      )}

    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
 */

