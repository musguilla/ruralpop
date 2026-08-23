"use client";

import React, { useState, useMemo } from "react";
import {
    X, Search, ChevronRight, Check, List,
    Tractor, Leaf, Apple, Hammer, Briefcase,
    Cloud, PiggyBank, Bird, Dog, Rabbit, Milk,
    Truck, Stethoscope, Anvil, MapPin
} from "lucide-react";
import { useCategories } from "@/context/CategoriesContext";
import Image from "next/image";

// Map icons to categories and subcategories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "ganaderia": <Image src="/icon-bovino.jpg" alt="Ganadería" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "maquinaria": <Image src="/icon-maquinaria.jpg" alt="Maquinaria" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "recambios-maquinaria": <Image src="/icon-repuestos.jpg" alt="Recambios" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "equipamiento-y-material": <Image src="/icon-equipamiento.jpg" alt="Equipamiento" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "agricultura": <Image src="/icon-agricultura.jpg" alt="Agricultura" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "forraje": <Image src="/icon-forraje.jpg" alt="Forraje" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "alimentos": <Image src="/icon-alimentoskm0.jpeg" alt="Alimentos" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "servicios": <Image src="/icon-transporte.jpg" alt="Servicios" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "fincas": <Image src="/icon-fincas.jpg" alt="Fincas" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "coches": <Image src="/icon-coches.jpg" alt="Coches" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "atv": <Image src="/icon-atv.jpg" alt="ATV" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "motos": <Image src="/icon-motos.jpg" alt="Motos" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
    "genetica-y-reproduccion": <Image src="/icon-genetica.jpg" alt="Genética" width={32} height={32} className="w-8 h-8 rounded-md object-cover" />,
};

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (categoryId: string, subcategoryId?: string) => void;
    selectedCategory?: string;
    selectedSubcategory?: string;
}

export function CategoryModal({
    isOpen,
    onClose,
    onSelect,
    selectedCategory = "",
    selectedSubcategory = ""
}: CategoryModalProps) {
    const CATEGORIES = useCategories();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeParent, setActiveParent] = useState<string | null>(null);
    const [isEquipop, setIsEquipop] = useState(false);

    // Reset when modal closes/opens
    React.useEffect(() => {
        setIsEquipop(window.location.hostname.includes("equipop"));
        if (isOpen) {
            setSearchTerm("");
            setActiveParent(null);
        }
    }, [isOpen]);

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return CATEGORIES;

        return CATEGORIES.map(cat => ({
            ...cat,
            subcategories: cat.subcategories.filter(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
        })).filter(cat =>
            cat.label.toLowerCase().includes(searchTerm.toLowerCase()) || cat.subcategories.length > 0
        );
    }, [searchTerm, CATEGORIES]);

    if (!isOpen) return null;

    const handleBack = () => setActiveParent(null);

    const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
        if (cat.subcategories.length > 0) {
            setActiveParent(cat.id);
        } else {
            onSelect(cat.id);
            onClose();
        }
    };

    const handleSubcategoryClick = (catId: string, subLabel: string) => {
        onSelect(catId, subLabel);
        onClose();
    };

    const currentParent = CATEGORIES.find(c => c.id === activeParent);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white sm:rounded-2xl shadow-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {activeParent && (
                            <button
                                onClick={handleBack}
                                className="p-1 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">
                            {activeParent ? currentParent?.label : "Categorías"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Box - Only show in main list or if filtering subcategories */}
                {!activeParent && (
                    <div className="px-6 py-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--ag-sys-color-primary)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar una categoría"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[var(--ag-sys-color-primary)] focus:bg-white rounded-xl outline-none transition-all text-gray-900"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="flex-1 overflow-y-auto px-2 pb-6">
                    {!activeParent ? (
                        <div className="flex flex-col gap-1">
                            {/* "All Categories" Option */}
                            <button
                                onClick={() => { onSelect(""); onClose(); }}
                                className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all group ${!selectedCategory ? (isEquipop ? 'bg-[#eef4f9] text-[var(--ag-sys-color-primary)] font-semibold border-2 border-[var(--ag-sys-color-primary)]' : 'bg-emerald-50 text-emerald-700 font-semibold border-2 border-emerald-500') : 'hover:bg-gray-50 border-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {!isEquipop && (
                                        <div className={`p-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                            <List className={`w-5 h-5 ${!selectedCategory ? 'text-emerald-700' : 'text-gray-500'}`} />
                                        </div>
                                    )}
                                    <span>Todas las categorías</span>
                                </div>
                                {!selectedCategory && <Check className="w-5 h-5 text-emerald-600" />}
                            </button>

                            <div className="h-px bg-gray-100 my-2 mx-4" />

                            {/* Category Items */}
                            {filteredCategories.map((cat) => (
                                <React.Fragment key={cat.id}>
                                    {isEquipop && !searchTerm && cat.label === 'Sillas de montar y accesorios' && (
                                        <div className="px-4 py-2 mt-2 text-[14px] bg-[#f5f9ff] font-bold text-[var(--ag-sys-color-primary)] uppercase tracking-wider">
                                            Para Caballos
                                        </div>
                                    )}
                                    {isEquipop && !searchTerm && cat.label === 'Calzado ecuestre' && (
                                        <div className="px-4 py-2 mt-4 text-[14px] bg-[#f5f9ff] font-bold text-[var(--ag-sys-color-primary)] uppercase tracking-wider">
                                            Para Riders
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${selectedCategory === cat.id && !selectedSubcategory ? (isEquipop ? 'bg-[#eef4f9] text-[var(--ag-sys-color-primary)] font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold') : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {!isEquipop && (
                                                <div className={`p-2 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                                    <div className={selectedCategory === cat.id ? 'text-emerald-700' : 'text-emerald-800'}>
                                                        {CATEGORY_ICONS[cat.id] || <List className="w-5 h-5" />}
                                                    </div>
                                                </div>
                                            )}
                                            <span>{cat.label}</span>
                                        </div>
                                        {cat.subcategories.length > 0 ? (
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                        ) : (
                                            selectedCategory === cat.id && !selectedSubcategory && <Check className="w-5 h-5 text-emerald-600" />
                                        )}
                                    </button>

                                    {/* Mostrar subcategorías coincidentes si hay una búsqueda activa */}
                                    {searchTerm.trim() !== "" && cat.subcategories.map(sub => (
                                        <button
                                            key={`${cat.id}-${sub}`}
                                            onClick={() => handleSubcategoryClick(cat.id, sub)}
                                            className={`flex items-center justify-between px-4 py-3 pl-14 rounded-xl transition-all group ${selectedSubcategory === sub ? (isEquipop ? 'bg-[#eef4f9] text-[var(--ag-sys-color-primary)] font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold') : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8"></div> {/* Spacer to align with main categories that have icons */}
                                                <span className="text-sm">{sub}</span>
                                            </div>
                                            {selectedSubcategory === sub && <Check className="w-5 h-5 text-emerald-600" />}
                                        </button>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        // Subcategories view
                        <div className="flex flex-col gap-1">
                            {/* "All in [Category]" option */}
                            <button
                                onClick={() => { onSelect(activeParent); onClose(); }}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${selectedCategory === activeParent && !selectedSubcategory ? (isEquipop ? 'bg-[#eef4f9] text-[var(--ag-sys-color-primary)] font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold') : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span>Todo en {currentParent?.label}</span>
                                {selectedCategory === activeParent && !selectedSubcategory && <Check className="w-5 h-5 text-emerald-600" />}
                            </button>

                            {currentParent?.subcategories.map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => handleSubcategoryClick(activeParent, sub)}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${selectedSubcategory === sub ? (isEquipop ? 'bg-[#eef4f9] text-[var(--ag-sys-color-primary)] font-semibold' : 'bg-emerald-50 text-emerald-700 font-semibold') : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{sub}</span>
                                    {selectedSubcategory === sub && <Check className="w-5 h-5 text-emerald-600" />}
                                </button>
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
 * - Implementación de Modal Custom con estética Milanuncios pero usando tokens de Ruralpop.
 * - Soporte para drill-down (Categoría -> Subcategoría) para mejorar la usabilidad en listas largas.
 * - Buscador integrado que filtra dinámicamente tanto categorías como subcategorías.
 * - Uso de Lucide-React para iconos, manteniendo coherencia con el resto de la aplicación.
 * - Backdrop con blur y animaciones de entrada para sensación "premium".
 */
