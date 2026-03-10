"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, X, Edit2, Loader2, MapPin } from "lucide-react";
import { updateUserLocationData } from "@/app/account/actions";
import { LOCATIONS } from "@/constants/locations";

interface EditableLocationProps {
    initialProvinceId: string;
    initialMunicipalityId: string;
    initialLocation: string;
}

export function EditableLocation({ initialProvinceId, initialMunicipalityId, initialLocation }: EditableLocationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [provinceId, setProvinceId] = useState(initialProvinceId);
    const [municipalityId, setMunicipalityId] = useState(initialMunicipalityId);
    const [location, setLocation] = useState(initialLocation);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleSave = async () => {
        if (
            provinceId === initialProvinceId &&
            municipalityId === initialMunicipalityId &&
            location.trim() === initialLocation.trim()
        ) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        const res = await updateUserLocationData({
            province_id: provinceId ? Number(provinceId) : null,
            municipality_id: municipalityId || null,
            location: location.trim()
        });

        setIsLoading(false);
        if (res.success) {
            setIsEditing(false);
            if (res.message) {
                setSuccessMsg(res.message);
                setTimeout(() => setSuccessMsg(null), 5000);
            }
        } else {
            setError(res.error || "Error al actualizar");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setProvinceId(initialProvinceId);
            setMunicipalityId(initialMunicipalityId);
            setLocation(initialLocation);
            setIsEditing(false);
            setError(null);
        }
    };

    const getDisplayValue = () => {
        const parts = [];
        if (provinceId) {
            const p = LOCATIONS.find(l => l.id === provinceId);
            if (p) parts.push(p.name);
        }
        if (municipalityId) {
            const m = LOCATIONS.find(l => l.id === municipalityId);
            if (m) parts.push(m.name);
        }
        if (location) {
            parts.push(location);
        }

        if (parts.length === 0) return "No especificada";
        return parts.join(" - ");
    };

    return (
        <div className="flex flex-col group relative" ref={containerRef}>
            <dt className="flex items-center gap-2 text-sm font-semibold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                Ubicación
            </dt>
            <dd className="relative min-h-[40px]">
                {isEditing ? (
                    <div className="space-y-4 bg-white border border-[var(--ag-sys-color-border)] rounded-xl p-4 shadow-sm relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--ag-sys-color-text-muted)] mb-1 uppercase tracking-wider">Provincia</label>
                                <select
                                    value={provinceId}
                                    onChange={e => {
                                        setProvinceId(e.target.value);
                                        setMunicipalityId("");
                                    }}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 appearance-none"
                                >
                                    <option value="">Cualquiera</option>
                                    {LOCATIONS.filter(l => l.type === 'province').map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--ag-sys-color-text-muted)] mb-1 uppercase tracking-wider">Localidad</label>
                                <select
                                    value={municipalityId}
                                    onChange={e => setMunicipalityId(e.target.value)}
                                    className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 appearance-none"
                                    disabled={!provinceId}
                                    onKeyDown={handleKeyDown}
                                >
                                    <option value="">Cualquiera</option>
                                    {LOCATIONS.filter(l => l.type === 'municipality' && (!provinceId || l.province === LOCATIONS.find(prov => prov.id === provinceId)?.name)).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--ag-sys-color-text-muted)] mb-1 uppercase tracking-wider">Ubicación (Texto Libre)</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ej. Centro"
                                disabled={isLoading}
                                className="w-full bg-[var(--ag-sys-color-background)] border border-[var(--ag-sys-color-border)] rounded-lg px-3 py-2 text-sm font-medium text-[var(--ag-sys-color-text)] outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 transition-all"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setProvinceId(initialProvinceId);
                                    setMunicipalityId(initialMunicipalityId);
                                    setLocation(initialLocation);
                                    setIsEditing(false);
                                    setError(null);
                                }}
                                disabled={isLoading}
                                className="px-3 py-1.5 flex items-center gap-1.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-3 py-1.5 flex items-center gap-1.5 bg-[var(--ag-sys-color-primary)] text-white font-bold text-sm rounded-lg hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex w-full min-h-[40px] items-center justify-between p-2 -ml-2 rounded-xl hover:bg-[var(--ag-sys-color-background)] transition-colors cursor-pointer border border-transparent hover:border-[var(--ag-sys-color-border)]"
                        onClick={() => setIsEditing(true)}
                    >
                        <span className={`text-lg font-medium ${!initialLocation && !initialProvinceId && !initialMunicipalityId ? "text-gray-400 italic" : "text-[var(--ag-sys-color-text)]"}`}>
                            {getDisplayValue()}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 p-1 text-[var(--ag-sys-color-primary)] transition-opacity">
                            <Edit2 className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </dd>

            {/* Feedback Messages */}
            {error && (
                <p className="absolute -bottom-6 left-0 text-xs text-red-500 font-medium animate-in fade-in zoom-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {successMsg && (
                <p className="absolute -bottom-6 left-0 text-xs text-green-600 font-medium animate-in fade-in zoom-in slide-in-from-top-1">
                    {successMsg}
                </p>
            )}
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se encapsuló la edición de Ubicación avanzada en un solo componente field.
 * - Permite editar de forma transaccional los tres valores y ver su cambio antes de darle a guardar.
 */
