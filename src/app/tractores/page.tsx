import React from "react";
import Link from "next/link";
import { BookOpen, Tractor, ChevronRight } from "lucide-react";

export const metadata = {
    title: "Catálogos de Tractores y Fichas Técnicas | Ruralpop",
    description: "Accede a la mayor colección de catálogos en PDF y fichas técnicas de los principales fabricantes de tractores: John Deere, New Holland, Case, Massey Ferguson y más.",
};

const BRANDS = [
    {
        id: "case",
        name: "Case",
        color: "bg-red-600",
        textColor: "text-red-600",
        bgLight: "bg-red-50",
        border: "border-red-100",
        hoverBorder: "hover:border-red-300",
    },
    {
        id: "john-deere",
        name: "John Deere",
        color: "bg-[#367C2B]",
        textColor: "text-[#367C2B]",
        bgLight: "bg-green-50",
        border: "border-green-100",
        hoverBorder: "hover:border-green-300",
    },
    {
        id: "lamborghini",
        name: "Lamborghini",
        color: "bg-black",
        textColor: "text-black",
        bgLight: "bg-gray-50",
        border: "border-gray-200",
        hoverBorder: "hover:border-gray-400",
    },
    {
        id: "massey-ferguson",
        name: "Massey Ferguson",
        color: "bg-[#C8102E]",
        textColor: "text-[#C8102E]",
        bgLight: "bg-red-50",
        border: "border-red-100",
        hoverBorder: "hover:border-red-300",
    },
    {
        id: "mc-cormick",
        name: "Mc Cormick",
        color: "bg-[#E31837]",
        textColor: "text-[#E31837]",
        bgLight: "bg-red-50",
        border: "border-red-100",
        hoverBorder: "hover:border-red-300",
    },
    {
        id: "new-holland",
        name: "New Holland",
        color: "bg-[#002B7F]",
        textColor: "text-[#002B7F]",
        bgLight: "bg-blue-50",
        border: "border-blue-100",
        hoverBorder: "hover:border-blue-300",
    },
];

export default function TractoresIndexPage() {
    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center justify-center p-3 bg-[var(--ag-sys-color-primary)]/10 rounded-2xl mb-4">
                        <BookOpen className="w-8 h-8 text-[var(--ag-sys-color-primary)]" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight mb-4">
                        Catálogos de Tractores
                    </h1>
                    <p className="text-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                        Explora nuestra biblioteca documental exclusiva. Accede a todos los catálogos oficiales, fichas técnicas y manuales en PDF de las mejores marcas de maquinaria agrícola del mercado.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {BRANDS.map((brand) => (
                        <Link 
                            key={brand.id} 
                            href={`/tractores/${brand.id}`}
                            className={`group flex items-center p-6 bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${brand.border} ${brand.hoverBorder} overflow-hidden relative`}
                        >
                            {/* Decorative background circle */}
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${brand.bgLight} transition-transform duration-500 group-hover:scale-[2] -z-10 opacity-50`}></div>
                            
                            <div className={`w-14 h-14 ${brand.bgLight} ${brand.textColor} rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 relative overflow-hidden`}>
                                <Tractor className="w-7 h-7 relative z-10" />
                            </div>
                            
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight">
                                    {brand.name}
                                </h2>
                                <p className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                    Ver catálogos {brand.name}
                                </p>
                            </div>

                            <div className={`w-10 h-10 rounded-full bg-white border ${brand.border} flex items-center justify-center text-[var(--ag-sys-color-text-muted)] transition-colors group-hover:${brand.color} group-hover:text-white group-hover:border-transparent opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100`}>
                                <ChevronRight className="w-5 h-5 ml-0.5" />
                            </div>
                        </Link>
                    ))}
                </div>
                
                {/* Promo/SEO Banner Bottom */}
                <div className="mt-20 bg-gradient-to-br from-[var(--ag-sys-color-surface)] to-green-50/50 rounded-[2rem] p-8 sm:p-12 border border-[var(--ag-sys-color-border)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="max-w-xl text-center md:text-left">
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-2">
                            ¿Buscas tractores de segunda mano?
                        </h3>
                        <p className="text-[var(--ag-sys-color-text-muted)]">
                            Además de catálogos técnicos, en Ruralpop encontrarás miles de anuncios de tractores y maquinaria agrícola de ocasión cerca de ti.
                        </p>
                    </div>
                    <Link 
                        href="/s/tractores-segunda-mano" 
                        className="px-8 py-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-md shadow-[var(--ag-sys-color-primary)]/20 whitespace-nowrap"
                    >
                        Buscar Tractores
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Diseño UI Premium con tarjetas interactuables, shadows profundos y fondos decorativos que reaccionan al hover.
 * - Utilizado colores corporativos de cada marca (Ej: verde para John Deere, rojo para Case) para dar contexto visual premium incluso sin logos SVG.
 * - Añadido un Banner inferior SEO para enlazar cruzadamente el contenido técnico (catálogos) con el core del marketplace (anuncios).
 * - Componente Server-Side, estático, perfecto para rendimiento SEO indexable.
 */
