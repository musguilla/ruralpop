import { createClient } from "@/utils/supabase/server";
import { ListingCard, ListingCardSkeleton, type Listing } from "@/components/ui/ListingCard";
import { Suspense } from "react";
import { Tractor } from "lucide-react";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { HomeSearchHero } from "@/components/ui/HomeSearchHero";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Pasamos los searchParams como Server Component prop.
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">

      {/* Conditionally render Search Hero or Active Search Bar */}
      {Object.keys(searchParams).length === 0 ? (
        <HomeSearchHero />
      ) : (
        <Suspense fallback={<div className="h-16 w-full animate-pulse bg-[var(--ag-sys-color-surface)] mb-6" />}>
          <ActiveSearchBar />
        </Suspense>
      )}

      {/* Grid Server-side */}
      <Suspense fallback={<GridSkeleton />}>
        <ListingsGrid searchParams={searchParams} />
      </Suspense>

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

import { Pagination } from "@/components/ui/Pagination";

async function ListingsGrid({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();
  const PAGE_SIZE = 40;
  const currentPage = Number(searchParams.page) || 1;
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("listings")
    .select("id, title, price, location, image_urls, created_at, category, price_type", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Filter based on search params
  const categoryFilter = searchParams.category as string;
  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const subcategoryFilter = searchParams.subcategory as string;
  if (subcategoryFilter) {
    query = query.ilike("subcategory", subcategoryFilter);
  }

  const textQuery = searchParams.q as string;
  if (textQuery) {
    query = query.or(`title.ilike.%${textQuery}%,description.ilike.%${textQuery}%`);
  }

  const priceMin = searchParams.price_min as string;
  if (priceMin) {
    query = query.gte("price", priceMin);
  }

  const priceMax = searchParams.price_max as string;
  if (priceMax) {
    query = query.lte("price", priceMax);
  }

  const locationFilter = searchParams.province_id as string;
  if (locationFilter) {
    query = query.eq("province_id", locationFilter);
  }

  // Seller type logic could be added if you have a seller_type column
  // const sellerType = searchParams.seller_type as string;
  // if(sellerType && sellerType !== 'all') {
  //    query = query.eq('seller_type', sellerType);
  // }

  // Ejecutar query con rango para paginación
  const { data: listings, error, count } = await query.range(from, to);

  if (error) {
    console.error("Supabase Error fetching listings:", error);
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
        Error al cargar los anuncios. Inténtelo de nuevo más tarde.
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl">
        <Tractor className="w-16 h-16 text-[var(--ag-sys-color-border)] mb-4" />
        <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-2">
          No hay resultados
        </h3>
        <p className="text-[var(--ag-sys-color-text-muted)]">
          No hemos encontrado ningún anuncio que coincida con tus filtros.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing: Listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Next.js App Router (SSR): Home pre-renderiza Grid Skeleton en lo que resuelve el DB Fetch.
 * - 'q' search param está pensado para enlazarse en el Header (SearchInput)
 * - `Suspense` wraps `ListingsGrid` making it extremely fast, initial HTML layout gets delivered instantly.
 */
