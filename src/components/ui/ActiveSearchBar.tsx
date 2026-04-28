"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { Search, X, SlidersHorizontal, MapPin, ArrowDownUp } from "lucide-react";
import { LOCATIONS } from "@/constants/locations";
import { useCategories } from "@/context/CategoriesContext";
import { parseSeoUrl, buildSeoUrl } from "@/utils/seoUtils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export function ActiveSearchBar() {
    const CATEGORIES = useCategories();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const urlParams = useParams();

    const slug = urlParams?.slug as string | undefined;
    const parsedSlug = slug ? parseSeoUrl(slug) : null;

    const query = parsedSlug ? parsedSlug.q : searchParams.get("q");
    const category = parsedSlug ? parsedSlug.category : searchParams.get("category");
    const subcategory = parsedSlug ? parsedSlug.subcategory : searchParams.get("subcategory");
    const location = parsedSlug ? parsedSlug.province_id : searchParams.get("province_id");

    const [inputValue, setInputValue] = useState(query || "");

    React.useEffect(() => {
        setInputValue(query || "");
    }, [query]);

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);

    const activeSort = searchParams.get("sort") || "relevance";

    // Local state for modal filters
    const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
    const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
    const [sellerType, setSellerType] = useState(searchParams.get("seller_type") || "all");

    // Unified category/subcategory state
    const [modalCategoryValue, setModalCategoryValue] = useState(() => {
        if (subcategory) return `sub_${subcategory}`;
        if (category) return `cat_${category}`;
        return "";
    });

    const [modalLocation, setModalLocation] = useState(location || "");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("q") as string;

        const url = buildSeoUrl({
            q: searchQuery || undefined,
            category: category || undefined,
            subcategory: subcategory || undefined,
            province_id: location || undefined
        });

        // Maintain any extra query params like price max/min
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("category");
        params.delete("subcategory");
        params.delete("province_id");

        const queryStr = params.toString();
        router.push(`${url}${queryStr ? '?' + queryStr : ''}`);
    };

    const handleClearSearch = () => {
        setInputValue("");
        const url = buildSeoUrl({
            q: undefined,
            category: category || undefined,
            subcategory: subcategory || undefined,
            province_id: location || undefined
        });

        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        params.delete("category");
        params.delete("subcategory");
        params.delete("province_id");

        const queryStr = params.toString();
        router.push(`${url}${queryStr ? '?' + queryStr : ''}`);
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (priceMin) params.set("price_min", priceMin);
        else params.delete("price_min");

        if (priceMax) params.set("price_max", priceMax);
        else params.delete("price_max");

        if (sellerType !== "all") params.set("seller_type", sellerType);
        else params.delete("seller_type");

        setIsFiltersOpen(false);

        let newCat = undefined;
        let newSub = undefined;

        if (modalCategoryValue.startsWith("cat_")) {
            newCat = modalCategoryValue.replace("cat_", "");
        } else if (modalCategoryValue.startsWith("sub_")) {
            newSub = modalCategoryValue.replace("sub_", "");
            // Find parent category to generate SEO URL properly
            newCat = CATEGORIES.find(c => c.subcategories.includes(newSub!))?.id;
        }

        const baseUrl = buildSeoUrl({
            q: query ?? undefined,
            category: newCat || undefined,
            subcategory: newSub || undefined,
            province_id: modalLocation || undefined
        });

        params.delete("q");
        params.delete("category");
        params.delete("subcategory");
        params.delete("province_id");

        const queryStr = params.toString();
        router.push(`${baseUrl}${queryStr ? '?' + queryStr : ''}`);
    };

    const clearFilters = () => {
        setPriceMin("");
        setPriceMax("");
        setSellerType("all");
        setModalCategoryValue("");
        setModalLocation("");

        const baseUrl = buildSeoUrl({
            q: query || undefined,
            category: undefined,
            subcategory: undefined,
            province_id: undefined
        });

        router.push(baseUrl);
        setIsFiltersOpen(false);
    };



    // Calculate Active Badges
    const activeBadges = [];
    if (subcategory && subcategory.trim() !== "") {
        activeBadges.push({ type: 'subcategory', label: subcategory });
    } else if (category && category.trim() !== "") {
        const catObj = CATEGORIES.find(c => c.id === category);
        activeBadges.push({ type: 'category', label: catObj ? catObj.label : category });
    }
    if (location && location.trim() !== "" && location !== "all" && location !== "Toda España") {
        const locObj = LOCATIONS.find(l => l.id === location);
        activeBadges.push({ type: 'location', label: locObj ? locObj.name : location });
    }
    const currentPriceMin = searchParams.get("price_min");
    const currentPriceMax = searchParams.get("price_max");
    if (currentPriceMin || currentPriceMax) {
        activeBadges.push({ type: 'price', label: 'Precio' });
    }
    const currentSellerType = searchParams.get("seller_type");
    if (currentSellerType && currentSellerType !== "all") {
        activeBadges.push({ type: 'seller_type', label: `Vendedor: ${currentSellerType}` });
    }

    const applySort = (sortParam: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (sortParam === "relevance") {
            params.delete("sort");
        } else {
            params.set("sort", sortParam);
        }
        setIsSortModalOpen(false);

        // Keep current path and inject new params
        const url = buildSeoUrl({
            q: query ?? undefined,
            category: category ?? undefined,
            subcategory: subcategory ?? undefined,
            province_id: location ?? undefined
        });

        // Remove SEO params from regular search params to avoid duplication
        params.delete("q");
        params.delete("category");
        params.delete("subcategory");
        params.delete("province_id");

        const queryStr = params.toString();
        router.push(`${url}${queryStr ? '?' + queryStr : ''}`);
    };

    const SORT_OPTIONS = [
        { id: "relevance", label: "Relevancia" },
        { id: "cheap", label: "Baratos primero" },
        { id: "expensive", label: "Caro primero" },
        { id: "recent", label: "Más recientes" },
    ];

    return (
        <div className="w-full flex flex-col items-center pt-1 pb-4 sm:pt-2 sm:pb-6 mb-4 sm:mb-2">
            <div className="flex gap-3 w-full mx-auto">
                {/* Search Bar */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 relative flex items-center bg-white border border-[#505050] rounded-full focus-within:ring-2 focus-within:ring-[var(--ag-sys-color-primary)] transition-all overflow-hidden h-14"
                >
                    <Search className="w-5 h-5 text-gray-400 absolute left-4" />
                    <input
                        type="text"
                        name="q"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Buscar en anuncios..."
                        className="w-full h-full pl-12 pr-12 bg-transparent outline-none text-[var(--ag-sys-color-text)] placeholder:text-gray-400"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-4 p-1 text-gray-400 hover:text-[var(--ag-sys-color-text)] transition-colors rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </form>

                {/* Filters Button */}
                <button
                    onClick={() => setIsFiltersOpen(true)}
                    className="flex items-center gap-2 bg-white border border-[#505050] rounded-full px-4 sm:px-6 h-14 text-[var(--ag-sys-color-text)] font-semibold text-base hover:border-[var(--ag-sys-color-primary)] transition-all shrink-0"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden sm:inline">Filtros</span>
                    {activeBadges.length > 0 && (
                        <span className="bg-[#1a7f5a] text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ml-1">
                            {activeBadges.length}
                        </span>
                    )}
                </button>

                {/* Sort Button */}
                <button
                    onClick={() => setIsSortModalOpen(true)}
                    className="flex justify-center items-center w-14 sm:w-auto sm:px-6 sm:gap-2 bg-white border border-[#505050] rounded-full h-14 text-[var(--ag-sys-color-text)] font-semibold text-base hover:border-[var(--ag-sys-color-primary)] transition-all shrink-0"
                >
                    <ArrowDownUp className="w-5 h-5" />
                    <span className="hidden sm:inline">Ordenar</span>
                </button>
            </div>

            {/* Active Sort Indicator Sub-bar */}
            {activeSort !== "relevance" && (
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto mt-2 flex justify-end">
                    <div className="text-sm flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100 font-medium">
                        <span className="opacity-80">Ordenación:</span> {SORT_OPTIONS.find(s => s.id === activeSort)?.label}
                        <button onClick={() => applySort("relevance")} className="ml-1 hover:text-emerald-900 bg-emerald-200/60 rounded-full p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop & Modal */}
            {isFiltersOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center bg-black/50 overflow-y-auto w-full transition-opacity">
                    <div className="bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:h-fit sm:my-auto sm:rounded-2xl flex flex-col relative animate-in slide-in-from-bottom-5">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-[var(--ag-sys-color-border)]">
                            <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                            <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">

                            {/* Categories */}
                            <div className="space-y-2 flex flex-col">
                                <label className="flex items-center justify-between cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <span className="font-semibold text-gray-900 text-sm">Categoría</span>
                                </label>
                                <SearchableSelect
                                    name="modalCategory"
                                    value={modalCategoryValue}
                                    onChange={(val) => setModalCategoryValue(val as string)}
                                    options={[
                                        { id: "", name: "Todas las categorías" },
                                        ...CATEGORIES.flatMap(c => [
                                            { id: `cat_${c.id}`, name: c.label },
                                            ...c.subcategories.map(sub => ({ id: `sub_${sub}`, name: `↳ ${sub}` }))
                                        ])
                                    ]}
                                    placeholder="Todas las categorías"
                                    searchPlaceholder="Buscar categoría o subcategoría..."
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2 flex flex-col">
                                <label className="flex items-center gap-1.5 cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                                    <span className="font-semibold text-gray-900 text-sm">Localización</span>
                                </label>
                                <SearchableSelect
                                    name="modalLocation"
                                    value={modalLocation}
                                    onChange={(val) => setModalLocation(val as string)}
                                    options={[
                                        { id: "", name: "Toda España" },
                                        ...LOCATIONS.filter(loc => loc.type === 'province').map(loc => ({ id: loc.id, name: loc.name }))
                                    ]}
                                    placeholder="Toda España"
                                    searchPlaceholder="Buscar provincia..."
                                />
                            </div>

                            {/* Price */}
                            <div className="space-y-3">
                                <span className="font-semibold text-gray-900 text-sm block">Precio</span>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Desde"
                                            className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none bg-gray-50"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            placeholder="Hasta"
                                            className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none bg-gray-50"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Type */}
                            <div className="space-y-3">
                                <span className="font-semibold text-gray-900 text-sm block">Tipo de vendedor</span>
                                <div className="flex bg-gray-50 border border-[var(--ag-sys-color-border)] rounded-lg p-1 overflow-hidden">
                                    {(['all', 'particular', 'profesional'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSellerType(type)}
                                            className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-colors ${sellerType === type ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[var(--ag-sys-color-border)] flex gap-4">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-3 text-emerald-700 font-semibold text-sm hover:underline"
                            >
                                Limpiar filtros
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
                            >
                                Ver resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Modal */}
            {isSortModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center bg-black/50 overflow-y-auto w-full transition-opacity">
                    <div className="bg-white w-full max-w-sm min-h-screen sm:min-h-0 sm:h-fit sm:my-auto sm:rounded-2xl flex flex-col relative animate-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center p-4 border-b border-[var(--ag-sys-color-border)]">
                            <h2 className="text-xl font-bold text-gray-900">Ordenar por</h2>
                            <button onClick={() => setIsSortModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex flex-col p-2 space-y-1">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => applySort(opt.id)}
                                    className={`text-left px-4 py-4 rounded-xl font-medium transition-colors ${activeSort === opt.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
