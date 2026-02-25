"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LOCATIONS } from "@/constants/locations";
import { CATEGORIES } from "@/constants/categories";
import { buildSeoUrl } from "@/utils/seoUtils";

export function SeoFooterTabs() {
    const [activeTab, setActiveTab] = useState<"provinces" | "categories" | "popular">("provinces");

    // Filtrar solo las provincias para la primera pestaña
    const provinces = LOCATIONS.filter(l => l.type === "province").sort((a, b) => a.province.localeCompare(b.province));

    // Generar enlaces naturales para "Más buscado"
    const generatePopularSearches = () => {
        const searches: { label: string, url: string }[] = [];
        const actionVerbs = ["Comprar", "Vender", "Alquilar", "Ofertas de"];
        const customProvinces = ["Asturias", "Cantabria", "Lugo", "A Coruña", "Ourense", "Pontevedra", "León", "Zamora"];

        // Mezclamos algunas subcategorías de ganadería
        const topSubcats = ["Bovino", "Equino", "Ovino", "Porcino", "Caprino"];

        // 1. Ganado por provincia
        topSubcats.forEach(sub => {
            customProvinces.forEach(prov => {
                const provObj = LOCATIONS.find(l => l.province === prov || l.name === prov);
                if (provObj) {
                    searches.push({
                        label: `Comprar ganado ${sub} en ${prov}`,
                        url: buildSeoUrl({ category: "ganaderia", subcategory: sub, province_id: provObj.id })
                    });
                }
            });
        });

        // 2. Otras categorías por provincia
        CATEGORIES.forEach(cat => {
            if (cat.id !== "ganaderia") {
                ["Asturias", "Lugo", "A Coruña", "Madrid", "Cantabria"].forEach(prov => {
                    const provObj = LOCATIONS.find(l => l.province === prov || l.name === prov);
                    if (provObj) {
                        searches.push({
                            label: `${cat.label} en ${prov}`,
                            url: buildSeoUrl({ category: cat.id, province_id: provObj.id })
                        });
                    }
                });
            }
        });

        // 3. Vender animales
        topSubcats.forEach(sub => {
            searches.push({
                label: `Vender ${sub} rápido`,
                url: buildSeoUrl({ category: "ganaderia", subcategory: sub })
            });
        });

        return searches.slice(0, 60); // Tomamos 60 exactos
    };

    const popularSearches = generatePopularSearches();

    return (
        <div className="bg-[var(--ag-sys-color-surface)] border-t border-[var(--ag-sys-color-border)] py-12 pb-24">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-2xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">
                    Lo más buscado en Ruralpop
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap border-b border-[var(--ag-sys-color-border)] mb-8">
                    <button
                        onClick={() => setActiveTab("provinces")}
                        className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "provinces"
                                ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                            }`}
                    >
                        Por provincias
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "categories"
                                ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                            }`}
                    >
                        Por categorías
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`py-3 px-6 font-bold text-sm tracking-wide transition-all ${activeTab === "popular"
                                ? "text-[var(--ag-sys-color-primary)] border-b-2 border-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/5"
                                : "text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)]"
                            }`}
                    >
                        Más buscado
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="text-sm">
                    {activeTab === "provinces" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-6">
                            {provinces.map((prov) => (
                                <Link
                                    key={prov.id}
                                    href={buildSeoUrl({ province_id: prov.id })}
                                    className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors"
                                >
                                    {prov.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === "categories" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
                            {CATEGORIES.map((cat) => (
                                <div key={cat.id} className="flex flex-col gap-2">
                                    <Link
                                        href={buildSeoUrl({ category: cat.id })}
                                        className="font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] hover:underline transition-colors mb-2"
                                    >
                                        {cat.label}
                                    </Link>
                                    {cat.subcategories.map((sub) => (
                                        <Link
                                            key={sub}
                                            href={buildSeoUrl({ category: cat.id, subcategory: sub })}
                                            className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors"
                                        >
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "popular" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-y-4 gap-x-6">
                            {popularSearches.map((search, idx) => (
                                <Link
                                    key={idx}
                                    href={search.url}
                                    className="text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] hover:underline truncate transition-colors"
                                >
                                    {search.label}
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
