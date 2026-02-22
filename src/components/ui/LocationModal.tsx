"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Search, MapPin, Check } from "lucide-react";
import { PROVINCES } from "@/constants/provinces";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (provinceId: string, name: string) => void;
    selectedLocationId?: string;
}

export function LocationModal({
    isOpen,
    onClose,
    onSelect,
    selectedLocationId = ""
}: LocationModalProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const filteredProvinces = useMemo(() => {
        if (!searchTerm.trim()) return PROVINCES;
        const term = searchTerm.toLowerCase();
        return PROVINCES.filter(p =>
            p.name.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    if (!isOpen) return null;

    const handleSelect = (id: string, name: string) => {
        onSelect(id, name);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white sm:rounded-2xl shadow-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">¿Dónde buscas?</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="px-6 py-4">
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Escribe tu provincia o localidad"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all text-gray-900 shadow-inner"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto px-2 pb-6 min-h-[350px]">
                    <div className="flex flex-col gap-1">
                        {!searchTerm && (
                            <button
                                onClick={() => handleSelect("", "Toda España")}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${!selectedLocationId ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${!selectedLocationId ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                    <Search className="w-5 h-5" />
                                </div>
                                <span>Toda España</span>
                                {!selectedLocationId && <Check className="ml-auto w-5 h-5 text-emerald-600" />}
                            </button>
                        )}

                        {filteredProvinces.map((province) => {
                            const term = searchTerm.toLowerCase();
                            const index = province.name.toLowerCase().indexOf(term);

                            const renderName = () => {
                                if (index === -1 || !searchTerm) return province.name;
                                const before = province.name.substring(0, index);
                                const match = province.name.substring(index, index + searchTerm.length);
                                const after = province.name.substring(index + searchTerm.length);
                                return (
                                    <>
                                        {before}<span className="font-bold text-gray-900">{match}</span>{after}
                                    </>
                                );
                            };

                            return (
                                <button
                                    key={province.id}
                                    onClick={() => handleSelect(province.id, province.name)}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${selectedLocationId === province.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${selectedLocationId === province.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 text-left flex flex-col">
                                        <span className="text-sm sm:text-base">{renderName()}</span>
                                        <span className="text-xs text-gray-400">Provincia</span>
                                    </div>
                                    {selectedLocationId === province.id && <Check className="w-5 h-5 text-emerald-600" />}
                                </button>
                            );
                        })}

                        {filteredProvinces.length === 0 && (
                            <div className="py-10 text-center text-gray-500">
                                <p>No se encontraron resultados para "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Apply Button at bottom for mobile feel */}
                <div className="p-4 border-t border-gray-100 sm:hidden">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-emerald-700 text-white rounded-xl font-bold shadow-lg"
                    >
                        Aplicar filtro
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se elimina la funcionalidad de geolocalización ("Cerca de mí") temporalmente por requerimiento del usuario.
 * - Se simplifica la UI eliminando las pestañas y dejando el campo de búsqueda como elemento principal.
 * - Se mantiene el sistema dinámico de filtrado y resaltado de texto para las provincias.
 * - Estética "premium" mantenida con desenfoque de fondo y micro-interacciones.
 */

