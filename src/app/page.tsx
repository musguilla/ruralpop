import { createClient } from "@/utils/supabase/server";
import { ListingCard, ListingCardSkeleton, type Listing } from "@/components/ui/ListingCard";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Suspense } from "react";
import { Tractor } from "lucide-react";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Pasamos los searchParams como Server Component prop.
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">

      {/* Hero Header para contexto de página inicial */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">
          Encuentra lo que necesitas
        </h1>
        <p className="mt-2 text-lg text-[var(--ag-sys-color-text-muted)]">
          Descubre anuncios recientes de animales, maquinaria y productos de la zona.
        </p>
      </div>

      {/* Barra de Filtros Interactiva (Client Component) */}
      <Suspense fallback={<div className="h-12 w-full bg-[var(--ag-sys-color-surface)] animate-pulse rounded-full mb-6" />}>
        <FiltersBar />
      </Suspense>

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

async function ListingsGrid({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, price, location, image_urls, created_at, category, price_type")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Filter based on search params
  const categoryFilter = searchParams.category as string;
  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const subcategoryFilter = searchParams.subcategory as string;
  if (subcategoryFilter) {
    // Uso de ilike para resiliencia ante variaciones de casing en URLs en producción
    query = query.ilike("subcategory", subcategoryFilter);
  }

  const textQuery = searchParams.q as string;
  if (textQuery) {
    // ILIKE %text% para título o descripción
    query = query.or(`title.ilike.%${textQuery}%,description.ilike.%${textQuery}%`);
  }

  const { data: listings, error } = await query.limit(20); // Inicial 20 elementos

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing: Listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

/**
 * Memory / Decisiones Técnicas:
 * - Next.js App Router (SSR): Home pre-renderiza Grid Skeleton en lo que resuelve el DB Fetch.
 * - 'q' search param está pensado para enlazarse en el Header (SearchInput)
 * - `Suspense` wraps `ListingsGrid` making it extremely fast, initial HTML layout gets delivered instantly.
 */
