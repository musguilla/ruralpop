"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, List, MapPin, Plus } from "lucide-react";
import { useCategories } from "@/context/CategoriesContext";
import { useTranslation } from "@/context/LocaleContext";
import { useLocalizedRoute } from "@/i18n/hooks";

import { CategoryModal } from "./CategoryModal";
import { LocationModal } from "./LocationModal";
import { buildSeoUrl } from "@/utils/seoUtils";

export function EquipopHomeSearchHero() {
    const CATEGORIES = useCategories();
    const { t } = useTranslation();
    const { getPath } = useLocalizedRoute();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [location, setLocation] = useState("");
    const [locationName, setLocationName] = useState(t("toda_espana"));
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const url = buildSeoUrl({
            q: query.trim(),
            category: category,
            subcategory: subcategory,
            province_id: location
        });
        router.push(getPath(url));
    };

    const handleCategorySelect = (catId: string, subId?: string) => {
        setCategory(catId);
        setSubcategory(subId || "");
    };

    const handleLocationSelect = (locId: string, name: string) => {
        setLocation(locId);
        setLocationName(name);
    };

    const getCategoryDisplayLabel = () => {
        if (!category) return t("todas_las_categorias");
        const cat = CATEGORIES.find(c => c.id === category);
        if (!cat) return t("todas_las_categorias");
        if (subcategory) return t(`category.${subcategory}`) || subcategory;
        return t(`category.${cat.id}`) || cat.label;
    };

    return (
        <div className="w-full flex flex-col items-center pb-6 sm:pb-10 pt-3 sm:pt-5 gap-6">
            <div className="w-full max-w-4xl px-4 flex flex-col items-center">
                <h1 className="hidden md:block text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8 text-center">
                    ¿Qué equipamiento buscas?
                </h1>

                {/* Desktop Search Bar */}
            <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-row items-center w-full max-w-4xl bg-white border border-[var(--ag-sys-color-border)] rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
            >
                {/* Query */}
                <div className="flex-1 flex items-center px-4 gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="silla salto, manta, botas, ..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 bg-transparent text-[var(--ag-sys-color-text)] outline-none"
                    />
                </div>

                {/* Category Button Trigger */}
                <div className="w-1/4 border-l border-gray-200 px-4 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="w-full flex items-center gap-2 bg-transparent text-[var(--ag-sys-color-text)] outline-none cursor-pointer group"
                    >
                        <List className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-[var(--ag-sys-color-primary)] transition-colors" />
                        <span className="truncate text-left flex-1">
                            {getCategoryDisplayLabel()}
                        </span>
                    </button>
                </div>

                {/* Location Button Trigger */}
                <div className="w-1/4 border-l border-gray-200 px-4 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(true)}
                        className="w-full flex items-center gap-2 bg-transparent text-[var(--ag-sys-color-text)] outline-none cursor-pointer group"
                    >
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-emerald-600 transition-colors" />
                        <span className="truncate text-left flex-1">
                            {locationName}
                        </span>
                    </button>
                </div>

                <button
                    type="submit"
                    className="bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    {t("buscar")}
                </button>
            </form>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="md:hidden w-full flex flex-col gap-3">
                <div className="flex flex-col gap-2 bg-white border border-[var(--ag-sys-color-border)] rounded-2xl p-2 shadow-sm">
                    <div className="flex items-center gap-2 px-3 h-12 border-b border-gray-100">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="silla salto, manta, botas, ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center gap-2 px-3 h-12 text-left bg-gray-50 rounded-xl"
                        >
                            <List className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="flex-1 text-[15px] text-gray-500 truncate">
                                {getCategoryDisplayLabel()}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-2 px-3 h-12 text-left bg-gray-50 rounded-xl"
                        >
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="flex-1 text-[15px] text-gray-500 truncate">
                                {locationName}
                            </span>
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-[var(--ag-sys-color-primary)] text-white h-12 rounded-full font-semibold flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    {t("buscar")}
                </button>
            </form>
            </div>

            {/* Wallapop-style Hero Banner */}
            <div className="w-full max-w-7xl mx-auto px-4 mt-6">
                <div className="flex flex-col md:flex-row w-full rounded-2xl overflow-hidden shadow-sm bg-[#194152]">
                    {/* Left side: Text & Button */}
                    <div className="w-full md:w-5/12 p-10 md:p-16 flex flex-col justify-center items-start">
                        <h2 className="text-xl md:text-3xl font-extrabold text-white leading-tight mb-8">
                            bienvenido a equipop, punto de encuentro de la comunidad ecuestre.<br />
                            vende lo que ya no usas. compra al mejor precio.<br />
                            conecta y comparte con otros jinetes y amazonas.
                        </h2>
                        <button 
                            onClick={() => router.push('/upload')}
                            className="bg-white hover:bg-gray-100 text-[#194152] px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Vender ahora
                        </button>
                    </div>
                    {/* Right side: Image */}
                    <div className="w-full md:w-7/12 relative min-h-[300px] md:min-h-full">
                        <img 
                            src="/equipop-hero-web.jpg" 
                            alt="Equipop compra y venta" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSelect={handleCategorySelect}
                selectedCategory={category}
                selectedSubcategory={subcategory}
            />

            {/* Location Modal */}
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelect={handleLocationSelect}
                selectedLocationId={location}
            />
        </div>
    );
}
