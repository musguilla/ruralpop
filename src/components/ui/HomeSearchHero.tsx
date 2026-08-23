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
import { useTranslation } from "@/context/LocaleContext";
import { useLocalizedRoute } from "@/i18n/hooks";

// Define a unified list for the slider
const VISUAL_CATEGORIES = [
    { id: "Bovino", type: "subcategory", label: "Bovino", icon: <Image src="/icon-bovino.jpg" alt="Bovino" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Equino", type: "subcategory", label: "Equino", icon: <Image src="/icon-equino.jpg" alt="Equino" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Caprino", type: "subcategory", label: "Caprino", icon: <Image src="/icon-caprino.jpg" alt="Caprino" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Ovino", type: "subcategory", label: "Ovino", icon: <Image src="/icon-ovino.jpg" alt="Ovino" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Porcino", type: "subcategory", label: "Porcino", icon: <Image src="/icon-porcino.jpg" alt="Porcino" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Avicultura", type: "subcategory", label: "Avicultura", icon: <Image src="/icon-avicultura.jpg" alt="Avicultura" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Apicultura", type: "subcategory", label: "Apicultura", icon: <Image src="/icon-apicultura.jpg" alt="Apicultura" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Conejos", type: "subcategory", label: "Conejos", icon: <Image src="/icon-conejos.jpg" alt="Conejos" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "maquinaria", type: "category", label: "Maquinaria", icon: <Image src="/icon-maquinaria.jpg" alt="Maquinaria" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "recambios-maquinaria", type: "category", label: "Recambios", icon: <Image src="/icon-repuestos.jpg" alt="Recambios" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "equipamiento-y-material", type: "category", label: "Equipamiento", icon: <Image src="/icon-equipamiento.jpg" alt="Equipamiento" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "agricultura", type: "category", label: "Agricultura", icon: <Image src="/icon-agricultura.jpg" alt="Agricultura" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "fincas", type: "category", label: "Fincas", icon: <Image src="/icon-fincas.jpg" alt="Fincas" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "forraje", type: "category", label: "Forraje", icon: <Image src="/icon-forraje.jpg" alt="Forraje" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "alimentos", type: "category", label: "Km0", icon: <Image src="/icon-alimentoskm0.jpeg" alt="Km0" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "coches", type: "category", label: "Coches", icon: <Image src="/icon-coches.jpg" alt="Coches" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "atv", type: "category", label: "ATV", icon: <Image src="/icon-atv.jpg" alt="ATV" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "motos", type: "category", label: "Motos", icon: <Image src="/icon-motos.jpg" alt="Motos" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Transporte", type: "subcategory", label: "Transporte", icon: <Image src="/icon-transporte.jpg" alt="Transporte" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "genetica-y-reproduccion", type: "category", label: "Genética", icon: <Image src="/icon-genetica.jpg" alt="Genética" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Veterinarios", type: "subcategory", label: "Veterinarios", icon: <Image src="/icon-veterinarios.jpg" alt="Veterinarios" width={76} height={76} className="object-cover rounded-xl" /> },
    { id: "Herradores", type: "subcategory", label: "Herradores", icon: <Image src="/icon-herradores.jpg" alt="Herradores" width={76} height={76} className="object-cover rounded-xl" /> },
];

import { CategoryModal } from "./CategoryModal";
import { LocationModal } from "./LocationModal";
import { buildSeoUrl } from "@/utils/seoUtils";

export function HomeSearchHero() {
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

    const sliderRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const url = buildSeoUrl({
            q: query.trim(),
            category: category,
            subcategory: subcategory,
            province_id: location
        });
        
        if (url === '/') {
            router.push('/?sort=recent');
        } else {
            router.push(getPath(url));
        }
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
        router.push(getPath(url));
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
        <div className="w-full flex flex-col items-center pb-4 sm:pb-6 pt-3 sm:pt-5">
            <h1 className="hidden md:block text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-8 text-center">
                {t("que_quieres_encontrar")}
            </h1>

            {/* Desktop Search Bar */}
            <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-row items-center w-full max-w-[960px] bg-white border border-[var(--ag-sys-color-border)] rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
            >
                {/* Query */}
                <div className="flex-1 flex items-center px-4 gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("estoy_buscando")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 bg-transparent text-[var(--ag-sys-color-text)] outline-none"
                    />
                </div>

                {/* Category Button Trigger */}
                <div className="w-[22%] border-l border-gray-200 px-4 flex items-center gap-2">
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
                <div className="w-[22%] border-l border-gray-200 px-4 flex items-center gap-2">
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
                            placeholder={t("estoy_buscando")}
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

            {/* Categories Slider */}
            <div className="w-full max-w-7xl mt-12 flex flex-col gap-6">

                {/* Header with Title and Arrows */}
                <div className="flex items-center justify-between w-full px-2">
                    <h2 className="text-xl font-bold text-[var(--ag-sys-color-text)]">{t("todas_las_categorias")}</h2>

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
                    className="grid grid-rows-2 grid-flow-col sm:flex sm:flex-row overflow-x-auto gap-x-2 gap-y-4 sm:gap-1 pb-4 hide-scrollbar w-full px-2"
                    style={{ touchAction: 'pan-y' }}
                >
                    {VISUAL_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center gap-3 shrink-0 group/btn transition-all p-4 rounded-2xl hover:bg-[#f4f5f5] active:scale-95"
                            style={{ minWidth: '110px' }}
                        >
                            <div className="w-[76px] h-[76px] flex items-center justify-center transition-transform group-hover/btn:scale-105">
                                {cat.icon}
                            </div>
                            <span className="text-[15px] font-bold text-[var(--ag-sys-color-text)] text-center w-full">
                                {t(`category.${cat.label}`) || cat.label}
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


