"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, Loader2, MapPin, ChevronDown, Search } from "lucide-react";
import { updateUserLocationData } from "@/app/account/actions";
import { LOCATIONS, LocationItem } from "@/constants/locations";

interface EditableLocationProps {
    initialProvinceId: string;
    initialMunicipalityId: string;
}

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder,
    disabled = false
}: {
    options: LocationItem[];
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    const filteredOptions = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return options.filter(o => {
            const lowerName = o.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return lowerName.includes(lowerSearch);
        }).slice(0, 50); // limit for performance if many localities
    }, [options, searchTerm]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                className={`w-full flex items-center justify-between bg-white border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--ag-sys-color-primary)]/30"}`}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        setSearchTerm("");
                    }
                }}
                disabled={disabled}
            >
                <span className={`block truncate text-lg font-medium ${selectedOption ? "text-[var(--ag-sys-color-text)]" : "text-[var(--ag-sys-color-text-muted)]"}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 text-[var(--ag-sys-color-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-[var(--ag-sys-color-border)] rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2">
                    <div className="flex items-center px-4 py-3 border-b border-[var(--ag-sys-color-border)] bg-gray-50/50">
                        <Search className="w-4 h-4 text-[var(--ag-sys-color-text-muted)] mr-2 shrink-0" />
                        <input
                            type="text"
                            autoFocus
                            className="w-full bg-transparent border-none focus:outline-none text-[var(--ag-sys-color-text)] text-sm font-medium placeholder-[var(--ag-sys-color-text-muted)]"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1">
                        <li
                            className="px-4 py-2 hover:bg-[var(--ag-sys-color-background)] cursor-pointer text-sm font-medium text-[var(--ag-sys-color-text-muted)] italic"
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                            }}
                        >
                            Cualquiera (Vaciar)
                        </li>
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-[var(--ag-sys-color-text-muted)] text-center">No se encontraron resultados</li>
                        ) : (
                            filteredOptions.map(option => (
                                <li
                                    key={option.id}
                                    className={`px-4 py-2.5 hover:bg-[var(--ag-sys-color-background)] cursor-pointer text-[var(--ag-sys-color-text)] font-medium transition-colors ${option.id === value ? "bg-[var(--ag-sys-color-background)]" : ""}`}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.name}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function EditableLocation({ initialProvinceId, initialMunicipalityId }: EditableLocationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [provinceId, setProvinceId] = useState(initialProvinceId);
    const [municipalityId, setMunicipalityId] = useState(initialMunicipalityId);

    const isDirty = provinceId !== initialProvinceId || municipalityId !== initialMunicipalityId;

    const provinces = useMemo(() => LOCATIONS.filter(l => l.type === 'province'), []);

    // Only fetch localities for the selected province name
    const localities = useMemo(() => {
        if (!provinceId) return LOCATIONS.filter(l => l.type === 'municipality');
        const pName = LOCATIONS.find(p => p.id === provinceId)?.name;
        return LOCATIONS.filter(l => l.type === 'municipality' && l.province === pName);
    }, [provinceId]);

    const handleSave = async () => {
        if (!isDirty) return;

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        const res = await updateUserLocationData({
            province_id: provinceId ? Number(provinceId) : null,
            municipality_id: municipalityId || null,
            location: "" // Eliminado campo texto libre
        });

        setIsLoading(false);
        if (res.success) {
            if (res.message) {
                setSuccessMsg(res.message);
                setTimeout(() => setSuccessMsg(null), 5000);
            }
            // we pretend it's no longer dirty by updating the state if we used props directly, 
            // but since we only check against initial props natively here, 
            // it's best to let a reload happen or trust the user sees success.
            // Normally we'd push router refresh. Let's just trigger a hard reload 
            // of the RSC tree by reloading window or wait for RSC revalidatePath.
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setError(res.error || "Error al actualizar");
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="flex flex-col group relative mt-6 col-span-1 md:col-span-2">
            <dt className="flex items-center gap-2 text-sm font-semibold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-4">
                <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                Tu Ubicación Default
            </dt>
            <dd className="relative">
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-[var(--ag-sys-color-border)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Provincia</label>
                            <SearchableSelect
                                options={provinces}
                                value={provinceId}
                                onChange={(val) => {
                                    setProvinceId(val);
                                    setMunicipalityId("");
                                }}
                                placeholder="Selecciona provincia..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">Localidad</label>
                            <SearchableSelect
                                options={localities}
                                value={municipalityId}
                                onChange={setMunicipalityId}
                                placeholder="Selecciona localidad..."
                                disabled={!provinceId}
                            />
                        </div>
                    </div>

                    <div className={`mt-6 flex justify-end transition-opacity duration-300 ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !isDirty}
                            className="px-6 py-3 flex items-center gap-2 bg-[var(--ag-sys-color-primary)] text-white font-bold text-lg rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all disabled:opacity-50 shadow-sm"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </dd>

            {/* Feedback Messages */}
            {error && (
                <p className="absolute -bottom-6 right-0 text-sm text-red-500 font-bold animate-in fade-in zoom-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {successMsg && (
                <p className="absolute -bottom-6 right-0 text-sm text-green-600 font-bold animate-in fade-in zoom-in slide-in-from-top-1">
                    {successMsg}
                </p>
            )}
        </div>
    );
}
