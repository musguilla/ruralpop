"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tag, X, Search, Check } from "lucide-react";
import { PREDEFINED_TAGS } from "@/constants/predefinedTags";

interface TagSelectorProps {
    category: string;
    subcategory: string;
    initialTags?: string[];
}

export function TagSelector({ category, subcategory, initialTags = [] }: TagSelectorProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
    const [searchTerm, setSearchTerm] = useState("");

    // Limpiar tags si cambia la categoría/subcategoría principal,
    // salvo en el render inicial donde queremos mantener initialTags
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
        setSelectedTags([]);
        setSearchTerm("");
    }, [category, subcategory]);

    // Obtener las etiquetas disponibles para la categoría/subcategoría actual
    const availableTags = useMemo(() => {
        const catKey = category.toLowerCase();
        const subcatKey = subcategory.toLowerCase();
        
        // Buscar la lista más específica posible
        let list: string[] = [];
        
        // Primero intentamos hacer match exacto de la subcategoría en PREDEFINED_TAGS
        // Buscamos la clave ignorando acentos y mayúsculas si es necesario, 
        // pero nuestro diccionario ya tiene claves sencillas
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const subKeyNormalized = normalize(subcategory);
        const catKeyNormalized = normalize(category);

        // Buscar coincidencia en las claves del diccionario
        for (const key of Object.keys(PREDEFINED_TAGS)) {
            const keyNormalized = normalize(key);
            if (keyNormalized === subKeyNormalized || keyNormalized === catKeyNormalized) {
                list = PREDEFINED_TAGS[key];
                break;
            }
        }
        
        // Fallback genérico si no encuentra
        if (list.length === 0 && PREDEFINED_TAGS["otros"]) {
            list = PREDEFINED_TAGS["otros"];
        }
        
        return list;
    }, [category, subcategory]);

    // Etiquetas filtradas por el buscador y excluyendo las ya seleccionadas
    const filteredTags = useMemo(() => {
        if (!availableTags) return [];
        return availableTags.filter(t => 
            !selectedTags.includes(t) && 
            t.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableTags, selectedTags, searchTerm]);

    // Mostramos máximo 8 etiquetas sugeridas a la vez
    const suggestedTags = filteredTags.slice(0, 8);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            if (selectedTags.length >= 10) return; // Límite de 10 tags por anuncio
            setSelectedTags(prev => [...prev, tag]);
            setSearchTerm(""); // Limpiar buscador tras seleccionar
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                Etiquetas (opcional)
                <span className="text-xs text-[var(--ag-sys-color-text-muted)] font-normal ml-2">
                    Ayuda a los compradores a encontrarte (Máx 10)
                </span>
            </label>

            {/* Input oculto para que el Server Action reciba el array */}
            <input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />

            {/* Buscador de etiquetas */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={category ? "Buscar características ej: 'vacas lecheras', 'john deere'..." : "Selecciona una categoría primero para ver etiquetas..."}
                    disabled={!category}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>

            {/* Etiquetas sugeridas (8 visibles) */}
            {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-colors border border-transparent hover:shadow-sm"
                        >
                            {tag}
                        </button>
                    ))}
                    {filteredTags.length > 8 && (
                        <span className="inline-flex items-center px-2 py-1.5 text-sm text-gray-400">
                            +{filteredTags.length - 8} más...
                        </span>
                    )}
                </div>
            )}

            {/* Etiquetas Seleccionadas */}
            {selectedTags.length > 0 && (
                <div className="p-4 bg-[var(--ag-sys-color-primary)]/5 rounded-xl border border-[var(--ag-sys-color-primary)]/20 mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ag-sys-color-primary)] mb-3 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Etiquetas elegidas ({selectedTags.length}/10)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[var(--ag-sys-color-primary)] text-white shadow-sm hover:bg-red-500 transition-colors group"
                            >
                                {tag}
                                <X className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
