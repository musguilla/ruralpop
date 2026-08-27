"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Search, MapPin, Check } from "lucide-react";
import { LOCATIONS, LocationItem } from "@/constants/locations";
import { useTranslation } from "@/context/LocaleContext";

const normalizeStr = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (locationId: string, name: string) => void;
    selectedLocationId?: string;
}

export function LocationModal({
    isOpen,
    onClose,
    onSelect,
    selectedLocationId = ""
}: LocationModalProps) {
    const { t, locale } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const [showSpainInPt, setShowSpainInPt] = useState(false);

    const isPt = locale === 'pt';

    const ptLocs = useMemo(() => LOCATIONS.filter(l => !isNaN(Number(l.id)) && Number(l.id) >= 100 && l.type === 'province'), []);
    const esLocs = useMemo(() => LOCATIONS.filter(l => (isNaN(Number(l.id)) || Number(l.id) < 100) && l.type === 'province'), []);

    const filteredLocations = useMemo(() => {
        if (!searchTerm.trim()) {
            if (isPt) return ptLocs;
            return esLocs;
        }
        
        const term = normalizeStr(searchTerm);
        // If searching, show from both if in PT, or maybe just ES if in ES?
        // Let's just search everything to be helpful.
        const all = isPt ? [...ptLocs, ...esLocs] : esLocs;
        return all.filter(l => normalizeStr(l.name).includes(term));
    }, [searchTerm, isPt, ptLocs, esLocs]);

    if (!isOpen) return null;

    const handleSelect = (loc: LocationItem) => {
        const displayName = loc.type === 'province' ? loc.name : `${loc.name}, ${loc.province}`;
        onSelect(loc.id, displayName);
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
                    <h2 className="text-xl font-bold text-gray-900">{t('location_modal.title')}</h2>
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
                            placeholder={t('location_modal.placeholder')}
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
                                onClick={() => { onSelect("", isPt ? 'Todo o Portugal' : t('location_modal.all_spain')); onClose(); }}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${!selectedLocationId ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span>{isPt ? 'Todo o Portugal' : t('location_modal.all_spain')}</span>
                                {!selectedLocationId && <Check className="ml-auto w-5 h-5 text-emerald-600" />}
                            </button>
                        )}

                        {filteredLocations.map((loc) => {
                            const term = normalizeStr(searchTerm);
                            const index = normalizeStr(loc.name).indexOf(term);

                            const renderName = () => {
                                if (index === -1 || !searchTerm) return loc.name;
                                const before = loc.name.substring(0, index);
                                const match = loc.name.substring(index, index + searchTerm.length);
                                const after = loc.name.substring(index + searchTerm.length);
                                return (
                                    <>
                                        {before}<span className="font-bold text-gray-900">{match}</span>{after}
                                    </>
                                );
                            };

                            return (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelect(loc)}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${selectedLocationId === loc.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'
                                        }`}
                                >

                                    <div className="flex-1 text-left flex flex-col">
                                        <span className="text-sm sm:text-base">
                                            {renderName()}
                                            {loc.type !== 'province' && (
                                                <span className="text-gray-400 ml-1">, {loc.province}</span>
                                            )}
                                        </span>
                                    </div>
                                    {selectedLocationId === loc.id && <Check className="w-5 h-5 text-emerald-600" />}
                                </button>
                            );
                        })}

                        {filteredLocations.length === 0 && (
                            <div className="py-10 text-center text-gray-500">
                                <p>{t('location_modal.no_results')} "{searchTerm}"</p>
                            </div>
                        )}

                        {!searchTerm && isPt && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowSpainInPt(!showSpainInPt)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-gray-800"
                                >
                                    <span>Espanha</span>
                                    <svg className={`w-5 h-5 transition-transform ${showSpainInPt ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showSpainInPt && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        <button
                                            onClick={() => { onSelect("", "Toda a Espanha"); onClose(); }}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-gray-50 text-sm sm:text-base text-gray-800"
                                        >
                                            Toda a Espanha
                                        </button>
                                        {esLocs.map(loc => (
                                            <button
                                                key={loc.id}
                                                onClick={() => handleSelect(loc)}
                                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${selectedLocationId === loc.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex-1 text-left flex flex-col">
                                                    <span className="text-sm sm:text-base text-gray-800">{loc.name}</span>
                                                </div>
                                                {selectedLocationId === loc.id && <Check className="w-5 h-5 text-emerald-600" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                        {t('location_modal.apply')}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se integra la funcionalidad de búsqueda de localidades junto con las provincias.
 * - Formato de visualización mejorado: 'Localidad, Provincia' para municipios y 'Provincia (Provincia)' para las capitales/provincias.
 * - Se ha centralizado la gestión de localizaciones en `locations.ts` para permitir una base de datos más extensa.
 * - El sistema de resaltado dinámico ahora aplica a todas las localizaciones encontradas.
 */


