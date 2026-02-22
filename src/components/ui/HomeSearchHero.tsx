"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search, List, MapPin, Tractor, Leaf, Apple, Settings, Hammer,
    Beef, PawPrint, Cloud, PiggyBank, Bird, Dog, Rabbit, Milk,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

// Define a unified list for the slider
const VISUAL_CATEGORIES = [
    { id: "animales", type: "category", label: "Animales", icon: <Tractor className="w-8 h-8 text-emerald-700" /> },
    { id: "Bovino", type: "subcategory", label: "Bovino", icon: <Beef className="w-8 h-8 text-emerald-700" /> },
    { id: "Equino", type: "subcategory", label: "Equino", icon: <PawPrint className="w-8 h-8 text-emerald-700" /> },
    { id: "Caprino", type: "subcategory", label: "Caprino", icon: <Milk className="w-8 h-8 text-emerald-700" /> },
    { id: "Ovino", type: "subcategory", label: "Ovino", icon: <Cloud className="w-8 h-8 text-emerald-700" /> },
    { id: "Porcino", type: "subcategory", label: "Porcino", icon: <PiggyBank className="w-8 h-8 text-emerald-700" /> },
    { id: "Avicultura", type: "subcategory", label: "Avicultura", icon: <Bird className="w-8 h-8 text-emerald-700" /> },
    { id: "Perros", type: "subcategory", label: "Perros", icon: <Dog className="w-8 h-8 text-emerald-700" /> },
    { id: "Conejos", type: "subcategory", label: "Conejos", icon: <Rabbit className="w-8 h-8 text-emerald-700" /> },
    { id: "maquinaria", type: "category", label: "Maquinaria", icon: <Hammer className="w-8 h-8 text-emerald-700" /> },
    { id: "forraje", type: "category", label: "Forraje", icon: <Leaf className="w-8 h-8 text-emerald-700" /> },
    { id: "alimentos", type: "category", label: "Alimentos Km0", icon: <Apple className="w-8 h-8 text-emerald-700" /> },
];

export function HomeSearchHero() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState(""); // For simplicity, province_id if available or just string

    const sliderRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category) params.set("category", category);
        if (location) params.set("province_id", location); // Mapping location string to province_id or leaving it flexible
        router.push(`/?${params.toString()}`);
    };

    const handleCategoryClick = (item: typeof VISUAL_CATEGORIES[0]) => {
        const params = new URLSearchParams();
        if (item.type === "category") {
            params.set("category", item.id);
        } else {
            // It's a subcategory of animals
            params.set("category", "animales");
            params.set("subcategory", item.id);
        }
        router.push(`/?${params.toString()}`);
    };

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -250, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 250, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full flex flex-col items-center py-6 sm:py-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8 text-center">
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
                        {/* Expandable with actual regions */}
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

            {/* Categories Slider */}
            <div className="w-full max-w-5xl mt-12 relative flex items-center group">
                {/* Left Arrow */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 z-10 w-10 h-10 bg-white shadow-md border border-[var(--ag-sys-color-border)] rounded-full flex items-center justify-center -ml-4 hidden md:group-hover:flex hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                {/* Slider Container */}
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto gap-8 pb-4 hide-scrollbar w-full px-2"
                    style={{ scrollAction: 'none' }} // Prevent browser back action on scroll
                >
                    {VISUAL_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center gap-3 shrink-0 group/btn transition-transform hover:-translate-y-1"
                            style={{ minWidth: '90px' }}
                        >
                            <div className="w-16 h-16 rounded-full border border-[var(--ag-sys-color-border)] group-hover/btn:border-[var(--ag-sys-color-primary)] bg-white flex items-center justify-center transition-colors shadow-sm">
                                {cat.icon}
                            </div>
                            <span className="text-sm font-semibold text-[var(--ag-sys-color-text)] text-center w-full">
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 z-10 w-10 h-10 bg-white shadow-md border border-[var(--ag-sys-color-border)] rounded-full flex items-center justify-center -mr-4 hidden md:group-hover:flex hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
    );
}
