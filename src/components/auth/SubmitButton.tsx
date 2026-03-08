"use client";

import React from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label = "Entrar" }: { label?: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all shadow-sm z-10 cursor-pointer ${pending
                    ? 'bg-[var(--ag-sys-color-primary)]/70 cursor-not-allowed'
                    : 'bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)]'
                }`}
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Cargando...
                </div>
            ) : (
                label
            )}
        </button>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Componente de cliente con useFormStatus.
 * - Da feedback visual ('Cargando...', spinner animado).
 * - Deshabilita el botón durante el submit (previene doble click).
 * - El z-10 y cursor-pointer previene bugs de z-index y Safari en mobile.
 */
