import React from "react";
import { Store } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tienda Equipop - Próximamente",
    description: "La tienda oficial de Equipop abrirá muy pronto. Encuentra todo el equipamiento que necesitas para tu caballo.",
};

export default function EquipopStorePage() {
    return (
        <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-[var(--ag-sys-color-primary)]/10 p-6 rounded-full mb-6">
                <Store className="w-16 h-16 text-[var(--ag-sys-color-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--ag-sys-color-text)] mb-4">
                Tienda Equipop
            </h1>
            <p className="text-lg text-[var(--ag-sys-color-text-muted)] max-w-lg mx-auto">
                Estamos preparando nuestra tienda oficial con el mejor equipamiento ecuestre, nutrición y accesorios. ¡Vuelve muy pronto!
            </p>
            <div className="mt-8">
                <a 
                    href="/" 
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[var(--ag-sys-color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    Volver al inicio
                </a>
            </div>

            {/* Documentación de memoria */}
            {/*
                * Decisiones Técnicas:
                * - Vista placeholder ('Próximamente') para la Tienda Equipop.
                * - Usa los tokens de Antigravity (var(--ag-sys-color-...)) para respetar el styling multitenant.
                * - El SEO está preparado con la Metadata nativa de Next.js App Router.
            */}
        </main>
    );
}
