"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, List, MapPin, Tractor, Leaf, Apple, Settings, Hammer } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "animales": <Tractor className="w-8 h-8 text-green-600" />,
    "maquinaria": <Hammer className="w-8 h-8 text-green-600" />,
    "forraje-alimentacion": <Leaf className="w-8 h-8 text-green-600" />,
    "alimentos-km0": <Apple className="w-8 h-8 text-green-600" />,
    // Fallback if there are other categories
    "default": <Settings className="w-8 h-8 text-green-600" />
};

export function HomeSearchHero() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState(""); // For simplicity, province_id if available or just string

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category) params.set("category", category);
        if (location) params.set("province_id", location); // Mapping location string to province_id or leaving it flexible
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="w-full flex flex-col items-center py-6 sm:py-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8">
                ¿Qué quieres encontrar?
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
                        placeholder="Estoy buscando..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 bg-transparent text-[var(--ag-sys-color-text)] outline-none"
                    />
                </div>

                {/* Category */}
                <div className="w-1/4 border-l border-gray-200 px-4 flex items-center gap-2">
                    <List className="w-5 h-5 text-gray-400 shrink-0" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-transparent text-[var(--ag-sys-color-text)] outline-none cursor-pointer truncate"
                    >
                        <option value="">Todas las categorías</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                {/* Location */}
                <div className="w-1/4 border-l border-gray-200 px-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent text-[var(--ag-sys-color-text)] outline-none cursor-pointer truncate"
                    >
                        <option value="">Toda España</option>
                        <option value="15">A Coruña</option>
                        <option value="33">Asturias</option>
                        {/* More provinces can be loaded dynamically or left to a generic search text if needed. For now sticking to mock/simple select or allowing text input. Ideally we pass provinces as props if we want a full select. */}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Buscar
                </button>
            </form>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="md:hidden w-full flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white border border-[var(--ag-sys-color-border)] rounded-full px-4 h-12">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Estoy buscando..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-[var(--ag-sys-color-primary)] text-white h-12 rounded-full font-semibold flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Buscar
                </button>
            </form>

            <div className="w-full max-w-4xl mt-12">
                <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-6">Todas las categorías</h2>
                <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar justify-start md:justify-center">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategory(cat.id);
                                router.push(`/?category=${cat.id}`);
                            }}
                            className="flex flex-col items-center gap-3 group min-w-[100px]"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-[var(--ag-sys-color-border)] group-hover:border-[var(--ag-sys-color-primary)] bg-white flex items-center justify-center transition-colors">
                                {CATEGORY_ICONS[cat.id] || CATEGORY_ICONS["default"]}
                            </div>
                            <span className="text-sm font-medium text-[var(--ag-sys-color-text)] text-center">
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

