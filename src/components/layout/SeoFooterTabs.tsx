"use client";
import { useTranslation } from "@/context/LocaleContext";

import React, { useState } from "react";
import Link from "next/link";
import { LOCATIONS } from "@/constants/locations";
import { useCategories } from "@/context/CategoriesContext";
import { buildSeoUrl } from "@/utils/seoUtils";

import { SEO_LANDINGS } from "@/constants/seoLandings";
import { SEO_LANDINGS_PT } from "@/constants/seoLandingsPt";
import { usePathname } from "next/navigation";

export function SeoFooterTabs({ activeEquipopData }: { activeEquipopData?: { categories: string[], subcategories: string[] } }) {
    const { locale } = useTranslation();
    const CATEGORIES = useCategories();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<"provinces" | "categories" | "popular">("popular");
    const [isEquipop, setIsEquipop] = useState(false);

    const landingsToUse = locale === 'pt' ? SEO_LANDINGS_PT : SEO_LANDINGS;

    React.useEffect(() => {
        const isEq = window.location.hostname.includes("equipop");
        setIsEquipop(isEq);
        if (isEq) {
            setActiveTab("categories");
        }
    }, []);

    // Ocultar si no estamos en la portada
    if (pathname !== "/") return null;

    // Filtrar solo las provincias para la primera pestaña
    const provinces = LOCATIONS.filter(l => l.type === "province").sort((a, b) => a.province.localeCompare(b.province));

    const ALWAYS_SHOW_CATEGORIES = new Set([
        "sillas-de-montar-y-accesorios",
        "mantillas-y-salvacruces",
        "cabezadas-y-riendas",
        "bocados-y-filetes",
        "mantas",
        "ropa-ecuestre-mujer",
        "ropa-ecuestre-hombre",
        "ropa-ecuestre-infantil",
        "equipamiento-de-competicin"
    ]);

    const activeCatsSet = new Set(activeEquipopData?.categories || []);
    const activeSubcatsSet = new Set(activeEquipopData?.subcategories || []);

    const equipopCatsToRender = CATEGORIES.filter(cat => {
        return ALWAYS_SHOW_CATEGORIES.has(cat.id) || activeCatsSet.has(cat.id);
    });

    return (
        <div className="bg-[var(--ag-sys-color-surface)] border-t border-[var(--ag-sys-color-border)] py-12 pb-24">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">
                    {isEquipop ? "Lo más buscado en Equipop" : "Lo más buscado en Ruralpop"}
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap border-b border-[var(--ag-sys-color-border)] mb-8">
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "popular"
                            ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                            : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                            }`}
                    >
                        Lo más buscado
                    </button>
                    {!isEquipop && (
                        <button
                            onClick={() => setActiveTab("provinces")}
                            className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "provinces"
                                ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                                }`}
                        >
                            Por provincias
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "categories"
                            ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                            : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                            }`}
                    >
                        Por categorías
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="text-sm">
                    {activeTab === "provinces" && !isEquipop && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-6">
                            {provinces.map((prov) => (
                                <Link
                                    key={prov.id}
                                    href={buildSeoUrl({ province_id: prov.id }, locale)}
                                    className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors"
                                >
                                    {prov.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "categories" && isEquipop && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
                            {equipopCatsToRender.map(cat => {
                                const isAlwaysShow = ALWAYS_SHOW_CATEGORIES.has(cat.id);
                                const subcategoriesToRender = cat.subcategories.filter(sub => isAlwaysShow || activeSubcatsSet.has(sub));

                                return (
                                    <div key={cat.id} className="flex flex-col gap-2">
                                        <Link href={buildSeoUrl({ category: cat.id }, locale)} className="font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] hover:underline transition-colors mb-2">
                                            {cat.label}
                                        </Link>
                                        {subcategoriesToRender.map((sub) => (
                                            <Link key={sub} href={buildSeoUrl({ category: cat.id, subcategory: sub }, locale)} className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors">
                                                {sub}
                                            </Link>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === "categories" && !isEquipop && (
                        (() => {
                            const renderCategoryBlock = (catId: string) => {
                                const cat = CATEGORIES.find(c => c.id === catId);
                                if (!cat) return null;
                                return (
                                    <div key={cat.id} className="flex flex-col gap-2">
                                        <Link href={buildSeoUrl({ category: cat.id }, locale)} className="font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] hover:underline transition-colors mb-2">
                                            {cat.label}
                                        </Link>
                                        {cat.subcategories.map((sub) => (
                                            <Link key={sub} href={buildSeoUrl({ category: cat.id, subcategory: sub }, locale)} className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors">
                                                {sub}
                                            </Link>
                                        ))}
                                    </div>
                                );
                            };

                            return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                                    <div className="flex flex-col gap-8">
                                        {["ganaderia", "alimentos", "camiones-y-furgonetas", "coches", "atv", "motos", "genetica-y-reproduccion"].map(renderCategoryBlock)}
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        {["maquinaria", "recambios-maquinaria"].map(renderCategoryBlock)}
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        {["equipamiento-y-material", "forraje"].map(renderCategoryBlock)}
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        {["servicios", "agricultura", "fincas"].map(renderCategoryBlock)}
                                    </div>
                                </div>
                            );
                        })()
                    )}

                    {activeTab === "popular" && isEquipop && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 gap-x-6">
                            {/* De momento vacío */}
                        </div>
                    )}

                    {activeTab === "popular" && !isEquipop && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-4 gap-x-6">
                            {landingsToUse.map((landing) => (
                                <Link
                                    key={landing.slug}
                                    href={landing.customUrl || `/s/${landing.slug}`}
                                    className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors"
                                >
                                    {landing.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se añade un componente de pestañas SEO renderizado en cliente para iterar eficientemente con Tailwind grid.
 * - Los enlaces tipo 'Más buscados' se generan combinando provincias del norte/centro populares y categorías de manera dinámica para facilitar el SEO por Long Tail.
 */
