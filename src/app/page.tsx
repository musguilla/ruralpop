import { createClient } from "@/utils/supabase/server";
import { ListingCardSkeleton } from "@/components/ui/ListingCard";
import { Suspense } from "react";
import { ActiveSearchBar } from "@/components/ui/ActiveSearchBar";
import { HomeSearchHero } from "@/components/ui/HomeSearchHero";
import { ListingsGrid } from "@/components/ui/ListingsGrid";

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

/**
 * Memory / Decisiones Técnicas:
 * - Next.js App Router (SSR): Home pre-renderiza Grid Skeleton en lo que resuelve el DB Fetch.
 * - 'q' search param está pensado para enlazarse en el Header (SearchInput)
 * - `Suspense` wraps `ListingsGrid` making it extremely fast, initial HTML layout gets delivered instantly.
 * - ListingsGrid se ha extraido a su propio componente para ser reutilizado en `[slug]/page.tsx`.
 */

