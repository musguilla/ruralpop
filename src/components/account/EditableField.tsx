"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, X, Edit2, Loader2 } from "lucide-react";
import { updateUserData } from "@/app/account/actions";

interface EditableFieldProps {
    field: "name" | "phone" | "email";
    initialValue: string;
    label: string;
    icon: React.ElementType;
    placeholder?: string;
    type?: "text" | "email" | "tel";
}

export function EditableField({ field, initialValue, label, icon: Icon, placeholder, type = "text" }: EditableFieldProps) {
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
                <Icon className="w-4 h-4 text-[var(--ag-sys-color-primary)]" />
                {label}
            </dt>
            <dd className="relative flex items-center min-h-[40px]">
                {isEditing ? (
                    <div className="flex w-full items-center gap-2">
                        <input
                            ref={inputRef}
                            type={type}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={isLoading}
                            className="flex-1 bg-white border border-[var(--ag-sys-color-border)] rounded-xl px-4 py-2 text-lg font-medium text-[var(--ag-sys-color-text)] outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)]/50 transition-all"
                        />
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="p-2 bg-[var(--ag-sys-color-primary)] text-white rounded-xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors disabled:opacity-50"
                            title="Guardar"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => {
                                setValue(initialValue);
                                setIsEditing(false);
                                setError(null);
                            }}
                            disabled={isLoading}
                            className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            title="Cancelar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex w-full items-center justify-between p-2 -ml-2 rounded-xl hover:bg-[var(--ag-sys-color-background)] transition-colors cursor-pointer border border-transparent hover:border-[var(--ag-sys-color-border)]"
                        onClick={() => setIsEditing(true)}
                    >
                        <span className={`text-lg font-medium ${!initialValue || initialValue === "No especificado" ? "text-gray-400 italic" : "text-[var(--ag-sys-color-text)]"}`}>
                            {value || "No especificado"}
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
 * - Se encapsuló la lógica de edición en línea (al vuelo) en un Client Component reusable.
 * - Aparece el lápiz al hacer hover en `dd`, y todo el recuadro es clickeable.
 * - Tiene loading state y deshabilita inputs para evitar doble envío de requests a Supabase.
 * - Maneja el onKeyDown para usar Enter para guardar o Escape para cancelar de forma rápida y accesible.
 */
