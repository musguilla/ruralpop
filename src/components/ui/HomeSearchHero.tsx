"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search, List, MapPin, Tractor, Leaf, Apple, Hammer,
    Cloud, PiggyBank, Bird, Dog, Rabbit, Milk,
    ChevronLeft, ChevronRight, Truck, Stethoscope, Anvil, Briefcase
} from "lucide-react";
import { CATEGORIES } from "@/constants/categories";

// Custom SVG to replace Cow (Bovino)
const CowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 10v4c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6v-4" />
        <path d="M3 10c0-2.8 2.2-5 5-5" />
        <path d="M21 10c0-2.8-2.2-5-5-5" />
        <path d="M8 5v1" />
        <path d="M16 5v1" />
        <path d="M9 14h6" />
    </svg>
);

// Custom SVG to replace Horse (Equino)
const HorseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 10l-3-6-3 4-4-2-2 4 4 6" />
        <path d="M10 16h6l2-2" />
        <path d="M14 8l-2 3" />
        <path d="M8 12l2-1" />
    </svg>
);

// Define a unified list for the slider
const VISUAL_CATEGORIES = [
    { id: "ganaderia", type: "category", label: "Ganadería", icon: <Tractor className="w-8 h-8 text-emerald-700" /> },
    { id: "Bovino", type: "subcategory", label: "Bovino", icon: <CowIcon className="w-8 h-8 text-emerald-700" /> },
    { id: "Equino", type: "subcategory", label: "Equino", icon: <HorseIcon className="w-8 h-8 text-emerald-700" /> },
    { id: "Caprino", type: "subcategory", label: "Caprino", icon: <Milk className="w-8 h-8 text-emerald-700" /> },
    { id: "Ovino", type: "subcategory", label: "Ovino", icon: <Cloud className="w-8 h-8 text-emerald-700" /> },
    { id: "Porcino", type: "subcategory", label: "Porcino", icon: <PiggyBank className="w-8 h-8 text-emerald-700" /> },
    { id: "Avicultura", type: "subcategory", label: "Avicultura", icon: <Bird className="w-8 h-8 text-emerald-700" /> },
    { id: "Perros", type: "subcategory", label: "Perros", icon: <Dog className="w-8 h-8 text-emerald-700" /> },
    { id: "Conejos", type: "subcategory", label: "Conejos", icon: <Rabbit className="w-8 h-8 text-emerald-700" /> },
    { id: "maquinaria", type: "category", label: "Maquinaria", icon: <Hammer className="w-8 h-8 text-emerald-700" /> },
    { id: "forraje", type: "category", label: "Forraje", icon: <Leaf className="w-8 h-8 text-emerald-700" /> },
    { id: "alimentos", type: "category", label: "Alimentos Km0", icon: <Apple className="w-8 h-8 text-emerald-700" /> },
    { id: "servicios", type: "category", label: "Servicios", icon: <Briefcase className="w-8 h-8 text-emerald-700" /> },
    { id: "Transporte", type: "subcategory", label: "Transporte", icon: <Truck className="w-8 h-8 text-emerald-700" /> },
    { id: "Veterinarios", type: "subcategory", label: "Veterinarios", icon: <Stethoscope className="w-8 h-8 text-emerald-700" /> },
    { id: "Herradores", type: "subcategory", label: "Herradores", icon: <Anvil className="w-8 h-8 text-emerald-700" /> },
];

import { CategoryModal } from "./CategoryModal";
import { LocationModal } from "./LocationModal";

export function HomeSearchHero() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [location, setLocation] = useState("");
    const [locationName, setLocationName] = useState("Toda España");
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const sliderRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category) params.set("category", category);
        if (subcategory) params.set("subcategory", subcategory);
        if (location) params.set("province_id", location);
        router.push(`/?${params.toString()}`);
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
        if (!category) return "Todas las categorías";
        const cat = CATEGORIES.find(c => c.id === category);
        if (!cat) return "Todas las categorías";
        if (subcategory) return subcategory;
        return cat.label;
    };

    const handleCategoryClick = (item: typeof VISUAL_CATEGORIES[0]) => {
        const params = new URLSearchParams();
        if (item.type === "category") {
            params.set("category", item.id);
        } else {
            // Dynamically set correct parent category
            if (["Transporte", "Veterinarios", "Herradores"].includes(item.id)) {
                params.set("category", "servicios");
            } else {
                params.set("category", "ganaderia");
            }
            params.set("subcategory", item.id);
        }
        router.push(`/?${params.toString()}`);
    };

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
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
                    Buscar
                </button>
            </form>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="md:hidden w-full flex flex-col gap-3">
                <div className="flex flex-col gap-2 bg-white border border-[var(--ag-sys-color-border)] rounded-2xl p-2 shadow-sm">
                    <div className="flex items-center gap-2 px-3 h-12 border-b border-gray-100">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Estoy buscando..."
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
                            <span className="flex-1 text-xs text-gray-600 truncate">
                                {getCategoryDisplayLabel()}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-2 px-3 h-12 text-left bg-gray-50 rounded-xl"
                        >
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="flex-1 text-xs text-gray-600 truncate">
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
                    Buscar
                </button>
            </form>

            {/* Categories Slider */}
            <div className="w-full max-w-5xl mt-12 flex flex-col gap-6">

                {/* Header with Title and Arrows */}
                <div className="flex items-center justify-between w-full px-2">
                    <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Todas las categorías</h2>

                    <div className="flex gap-2">
                        <button
                            onClick={scrollLeft}
                            className="w-10 h-10 bg-white border border-[var(--ag-sys-color-border)] rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-10 h-10 bg-white border border-[var(--ag-sys-color-border)] rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto gap-8 pb-4 hide-scrollbar w-full px-2"
                    style={{ touchAction: 'pan-y' }}
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

/**
 * Memory / Decisiones Técnicas:
 * - Se integran tanto el CategoryModal como el LocationModal para eliminar los selectores nativos.
 * - En móvil se ha optimizado la UI usando un grid de dos columnas para categorías y localización, permitiendo más espacio vertical.
 * - Se ha centralizado la gestión de provincias en un archivo de constantes para escalabilidad.
 * - La lógica de búsqueda sincroniza los IDs de provincia mientras muestra los nombres legibles al usuario.
 */


