"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, X, Edit2, Loader2 } from "lucide-react";
import { updateUserData } from "@/app/account/actions";

interface EditableFieldProps {
    field: "name" | "phone" | "email" | "commercial_name" | "company_description" | "company_address" | "company_zip" | "company_country" | "company_website";
    initialValue: string;
    label: string;
    icon: React.ReactNode;
    placeholder?: string;
    type?: "text" | "email" | "tel" | "url";
}

export function EditableField({ field, initialValue, label, icon, placeholder, type = "text" }: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (value.trim() === initialValue.trim() || !value.trim()) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        const res = await updateUserData(field, value.trim());

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
            setValue(initialValue);
            setIsEditing(false);
            setError(null);
        }
    };

    return (
        <div className="flex flex-col group relative">
            <dt className="flex items-center gap-2 text-sm font-semibold text-[var(--ag-sys-color-text-muted)] uppercase tracking-wider mb-2">
                {icon}
                {label}
            </dt>
            <dd className="relative flex items-center min-h-[40px]">
                {isEditing ? (
                    <div
                        className="relative flex w-full items-center min-w-0"
                        onBlur={(e) => {
                            // Guardar automáticamente al hacer clic fuera (perder foco de todo el bloque)
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                handleSave();
                            }
                        }}
                    >
                        <input
                            ref={inputRef}
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={isLoading}
                            className="w-full bg-white border border-[var(--ag-sys-color-primary)] rounded-xl pl-4 pr-20 py-2.5 text-base sm:text-lg font-medium text-[var(--ag-sys-color-text)] outline-none ring-4 ring-[var(--ag-sys-color-primary)]/10 transition-all shadow-sm"
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                onClick={handleSave}
                                disabled={isLoading || value.trim() === initialValue.trim() || !value.trim()}
                                className="p-1.5 bg-[var(--ag-sys-color-primary)] text-white rounded-lg hover:bg-[var(--ag-sys-color-primary-hover)] transition-all disabled:opacity-40 disabled:scale-95"
                                title="Guardar"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    setValue(initialValue);
                                    setIsEditing(false);
                                    setError(null);
                                }}
                                disabled={isLoading}
                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-all disabled:opacity-40"
                                title="Cancelar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex w-full items-center justify-between p-2 sm:p-3 -ml-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 group/view min-w-0"
                        onClick={() => setIsEditing(true)}
                    >
                        <span className={`text-base sm:text-lg font-medium truncate pr-4 ${!initialValue || initialValue === "No especificado" ? "text-gray-400 italic" : "text-[var(--ag-sys-color-text)]"}`}>
                            {value || "No especificado"}
                        </span>
                        <div className="opacity-0 group-hover/view:opacity-100 p-1.5 text-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/10 rounded-lg transition-all flex-shrink-0 scale-95 group-hover/view:scale-100">
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
 * - Se encapsuló la lógica de edición en línea (al vuelo) en un Client Component reusable.
 * - Aparece el lápiz al hacer hover en `dd`, y todo el recuadro es clickeable.
 * - Tiene loading state y deshabilita inputs para evitar doble envío de requests a Supabase.
 * - Maneja el onKeyDown para usar Enter para guardar o Escape para cancelar de forma rápida y accesible.
 */
