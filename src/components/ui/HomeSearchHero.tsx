"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Search, List, MapPin, Tractor, Leaf, Apple, Hammer,
    Cloud, PiggyBank, Bird, Dog, Rabbit, Milk,
    ChevronLeft, ChevronRight, Truck, Stethoscope, Anvil, Briefcase
} from "lucide-react";
import { useCategories } from "@/context/CategoriesContext";

// Define a unified list for the slider
const VISUAL_CATEGORIES = [
    { id: "Bovino", type: "subcategory", label: "Bovino", icon: <Image src="/icon-bovino.png" alt="Bovino" width={48} height={48} className="object-contain" /> },
    { id: "Equino", type: "subcategory", label: "Equino", icon: <Image src="/icon-equino.png" alt="Equino" width={48} height={48} className="object-contain" /> },
    { id: "Caprino", type: "subcategory", label: "Caprino", icon: <Image src="/icon-caprino.png" alt="Caprino" width={48} height={48} className="object-contain" /> },
    { id: "Ovino", type: "subcategory", label: "Ovino", icon: <Image src="/icon-ovino.png" alt="Ovino" width={48} height={48} className="object-contain" /> },
    { id: "Porcino", type: "subcategory", label: "Porcino", icon: <Image src="/icon-porcino.png" alt="Porcino" width={48} height={48} className="object-contain" /> },
    { id: "Avicultura", type: "subcategory", label: "Avicultura", icon: <Image src="/icon-aves.png" alt="Avicultura" width={48} height={48} className="object-contain" /> },
    { id: "Apicultura", type: "subcategory", label: "Apicultura", icon: <Image src="/icon-apicultura.webp" alt="Apicultura" width={48} height={48} className="object-contain" /> },
    { id: "Perros", type: "subcategory", label: "Perros", icon: <Image src="/icon-perro.png" alt="Perros" width={48} height={48} className="object-contain" /> },
    { id: "Conejos", type: "subcategory", label: "Conejos", icon: <Image src="/icon-conejos.png" alt="Conejos" width={48} height={48} className="object-contain" /> },
    { id: "maquinaria", type: "category", label: "Maquinaria", icon: <Image src="/icon-tractor.png" alt="Maquinaria" width={48} height={48} className="object-contain" /> },
    { id: "agricultura", type: "category", label: "Agricultura", icon: <Image src="/icon-agricultura.png" alt="Agricultura" width={48} height={48} className="object-contain" /> },
    { id: "fincas", type: "category", label: "Fincas", icon: <Image src="/icon-fincas.webp" alt="Fincas" width={48} height={48} className="object-contain" /> },
    { id: "forraje", type: "category", label: "Forraje", icon: <Image src="/icon-forraje.png" alt="Forraje" width={48} height={48} className="object-contain" /> },
    { id: "alimentos", type: "category", label: "Km0", icon: <Image src="/icon-alimentos.png" alt="Km0" width={48} height={48} className="object-contain" /> },
    { id: "Transporte", type: "subcategory", label: "Transporte", icon: <Image src="/icon-transportes.png" alt="Transporte" width={48} height={48} className="object-contain" /> },
    { id: "Veterinarios", type: "subcategory", label: "Veterinarios", icon: <Image src="/icon-veterinarios.png" alt="Veterinarios" width={48} height={48} className="object-contain" /> },
    { id: "Herradores", type: "subcategory", label: "Herradores", icon: <Image src="/icon-herradores.png" alt="Herradores" width={48} height={48} className="object-contain" /> },
];

import { CategoryModal } from "./CategoryModal";
import { LocationModal } from "./LocationModal";
import { buildSeoUrl } from "@/utils/seoUtils";

export function HomeSearchHero() {
    const CATEGORIES = useCategories();
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
        const url = buildSeoUrl({
            q: query.trim(),
            category: category,
            subcategory: subcategory,
            province_id: location
        });
        router.push(url);
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
        let cat = item.type === "category" ? item.id : undefined;
        let subcat = item.type === "subcategory" ? item.id : undefined;

        if (subcat) {
            // Dynamically set correct parent category
            if (["Transporte", "Veterinarios", "Herradores"].includes(subcat)) {
                cat = "servicios";
            } else {
                cat = "ganaderia";
            }
        }

        const url = buildSeoUrl({ category: cat, subcategory: subcat });
        router.push(url);
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
            <h1 className="hidden md:block text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8 text-center">
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
                    Buscar
                </button>
            </form>

            {/* Categories Slider */}
            <div className="w-full max-w-7xl mt-12 flex flex-col gap-6">

                {/* Header with Title and Arrows */}
                <div className="flex items-center justify-between w-full px-2">
                    <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">Todas las categorías</h2>

                    <div className="flex gap-3">
                        <button
                            onClick={scrollLeft}
                            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto gap-1 pb-4 hide-scrollbar w-full px-2"
                    style={{ touchAction: 'pan-y' }}
                >
                    {VISUAL_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center gap-3 shrink-0 group/btn transition-all p-4 rounded-2xl hover:bg-[#f4f5f5] active:scale-95"
                            style={{ minWidth: '110px' }}
                        >
                            <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover/btn:scale-105">
                                {cat.icon}
                            </div>
                            <span className="text-[15px] font-bold text-[var(--ag-sys-color-text)] text-center w-full">
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


