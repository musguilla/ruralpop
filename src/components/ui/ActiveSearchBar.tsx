"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, MapPin } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

export function ActiveSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Local state for modal filters
    const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
    const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
    const [sellerType, setSellerType] = useState(searchParams.get("seller_type") || "all");
    const [modalCategory, setModalCategory] = useState(searchParams.get("category") || "");
    const [modalLocation, setModalLocation] = useState(searchParams.get("province_id") || "");

    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const location = searchParams.get("province_id");

    // What is displayed in the active search pill
    let pillText = "Busqueda activa";
    if (query) pillText = query;
    else if (category) {
        const cat = CATEGORIES.find(c => c.id === category);
        pillText = cat ? cat.label : category;
    } else if (location) {
        pillText = `Provincia: ${location}`;
    }

    const clearSearch = () => {
        router.push(pathname);
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (priceMin) params.set("price_min", priceMin);
        else params.delete("price_min");

        if (priceMax) params.set("price_max", priceMax);
        else params.delete("price_max");

        if (sellerType !== "all") params.set("seller_type", sellerType);
        else params.delete("seller_type");

        if (modalCategory) params.set("category", modalCategory);
        else params.delete("category");

        if (modalLocation) params.set("province_id", modalLocation);
        else params.delete("province_id");

        setIsFiltersOpen(false);
        router.push(`/?${params.toString()}`);
    };

    const clearFilters = () => {
        setPriceMin("");
        setPriceMax("");
        setSellerType("all");
        setModalCategory("");
        setModalLocation("");
        router.push(pathname);
        setIsFiltersOpen(false);
    };

    return (
        <div className="w-full flex justify-center py-4 border-b border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] mb-6">
            <div className="flex gap-2 w-full max-w-4xl px-4">

                {/* Active Pill */}
                <div className="flex-1 flex items-center justify-between border border-[var(--ag-sys-color-border)] rounded-full px-4 py-2 hover:border-[var(--ag-sys-color-primary)] transition-colors cursor-pointer" onClick={() => clearSearch()}>
                    <div className="flex items-center gap-2 text-[var(--ag-sys-color-text)]">
                        <Search className="w-4 h-4 text-emerald-700" />
                        <span className="font-medium text-sm truncate">{pillText}</span>
                    </div>
                    <X className="w-4 h-4 text-[var(--ag-sys-color-text-muted)] hover:text-black" />
                </div>

                {/* Filters Button */}
                <button
                    onClick={() => setIsFiltersOpen(true)}
                    className="flex items-center gap-2 border border-[var(--ag-sys-color-border)] rounded-full px-4 py-2 text-[var(--ag-sys-color-text)] font-medium text-sm hover:border-[var(--ag-sys-color-primary)] transition-colors shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtros
                </button>
            </div>

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
                            <div className="space-y-2">
                                <label className="flex items-center justify-between cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <span className="font-semibold text-gray-900 text-sm">Categoría</span>
                                </label>
                                <select
                                    className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none"
                                    value={modalCategory}
                                    onChange={(e) => setModalCategory(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="flex items-center justify-between cursor-pointer w-full text-left py-2 hover:opacity-80">
                                    <span className="font-semibold text-gray-900 text-sm">Localización</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                    <select
                                        className="w-full border border-[var(--ag-sys-color-border)] rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none"
                                        value={modalLocation}
                                        onChange={(e) => setModalLocation(e.target.value)}
                                    >
                                        <option value="">Toda España</option>
                                        <option value="15">A Coruña</option>
                                        <option value="33">Asturias</option>
                                    </select>
                                </div>
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
        </div>
    );
}
