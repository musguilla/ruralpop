import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserFavorites } from "@/app/favoritos/actions";
import { ListingCard } from "@/components/ui/ListingCard";
import { Tractor, ArrowRight } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata = {
    title: "{dict.favorites.title} | Ruralpop",
    description: "Tus anuncios y animales guardados favoritos en Ruralpop",
};

export default async function FavoritosPage() {
    const headersList = await headers();
    const locale = (headersList.get("x-locale") || "es") as LocaleCode;
    const dict = await getDictionary(locale);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirectTo=/favoritos");
    }

    const { favorites, error } = await getUserFavorites();

    if (error) {
        return (
            <div className="w-full">
                <div className="container mx-auto px-4 py-12">
                    <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                        {dict.favorites.error_load}
                    </div>
                </div>
            </div>
        );
    }

    const availableFavorites = favorites?.filter((fav: any) => fav.listings?.status === 'active') || [];
    const unavailableCount = (favorites?.length || 0) - availableFavorites.length;

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] mb-2">{dict.favorites.title}</h1>
                    <p className="text-[var(--ag-sys-color-text-muted)]">
                        {availableFavorites.length} {availableFavorites.length === 1 ? dict.favorites.desc_single : dict.favorites.desc_multiple}
                    </p>
                </div>

                {!favorites || favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-3xl mt-8">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <Tractor className="w-10 h-10 text-rose-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-3">
                            {dict.favorites.empty_title}
                        </h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] mb-8 max-w-sm">
                            {dict.favorites.empty_desc}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-full hover:bg-[var(--ag-sys-color-primary-hover)] transition-all transform hover:scale-105"
                        >
                            {dict.favorites.explore_btn} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {availableFavorites.map((fav: any) => {
                                const listing = fav.listings;
                                if (!listing) return null;
                                return (
                                    <ListingCard
                                        key={fav.id}
                                        listing={listing}
                                        isFavorited={true}
                                    />
                                );
                            })}
                        </div>

                        {unavailableCount > 0 && (
                            <div className="mt-12 p-6 bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-bold text-lg text-[var(--ag-sys-color-text)] mb-1">
                                        {unavailableCount} {unavailableCount === 1 ? dict.favorites.unavailable_single : dict.favorites.unavailable_multiple}
                                    </h4>
                                    <p className="text-sm text-[var(--ag-sys-color-text-muted)]">
                                        {dict.favorites.unavailable_desc}
                                    </p>
                                </div>
                                <Link
                                    href="/"
                                    className="whitespace-nowrap inline-flex items-center justify-center px-6 py-3 font-bold rounded-xl bg-white border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] hover:bg-gray-50 transition-colors"
                                >
                                    {dict.favorites.search_more}
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se separa lógicamente los listings 'active' de los que ya no lo son para mostrar solo los útiles en la grilla y el contador en un banner decorativo abajo.
 * - Este es Server Component de alto rendimiento ya que usa getUserFavorites() importado de acciones de servidor, asegurando autenticación obligatoria.
 */
