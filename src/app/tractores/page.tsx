import React from "react";
import Link from "next/link";
import { BookOpen, Tractor, ChevronRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600; // Cache 1 hora

export const metadata = {
    title: "Catálogos de Tractores y Fichas Técnicas | Ruralpop",
    description: "Accede a la mayor colección de catálogos en PDF y fichas técnicas de los principales fabricantes de tractores: John Deere, New Holland, Case, Massey Ferguson y más.",
    alternates: { canonical: "/tractores" }
};

const BRAND_STYLES: Record<string, any> = {
    "case-ih": { color: "bg-red-600", textColor: "text-red-600", bgLight: "bg-red-50", border: "border-red-100", hoverBorder: "hover:border-red-300" },
    "john-deere": { color: "bg-[#367C2B]", textColor: "text-[#367C2B]", bgLight: "bg-green-50", border: "border-green-100", hoverBorder: "hover:border-green-300" },
    "lamborghini": { color: "bg-black", textColor: "text-black", bgLight: "bg-gray-50", border: "border-gray-200", hoverBorder: "hover:border-gray-400" },
    "massey-ferguson": { color: "bg-[#C8102E]", textColor: "text-[#C8102E]", bgLight: "bg-red-50", border: "border-red-100", hoverBorder: "hover:border-red-300" },
    "mccormick": { color: "bg-[#E31837]", textColor: "text-[#E31837]", bgLight: "bg-red-50", border: "border-red-100", hoverBorder: "hover:border-red-300" },
    "new-holland": { color: "bg-[#002B7F]", textColor: "text-[#002B7F]", bgLight: "bg-blue-50", border: "border-blue-100", hoverBorder: "hover:border-blue-300" },
    "fendt": { color: "bg-[#006039]", textColor: "text-[#006039]", bgLight: "bg-green-50", border: "border-green-100", hoverBorder: "hover:border-green-300" },
    "kubota": { color: "bg-[#FF6A00]", textColor: "text-[#FF6A00]", bgLight: "bg-orange-50", border: "border-orange-100", hoverBorder: "hover:border-orange-300" },
    "deutz-fahr": { color: "bg-[#91C124]", textColor: "text-[#91C124]", bgLight: "bg-lime-50", border: "border-lime-100", hoverBorder: "hover:border-lime-300" },
    "valtra": { color: "bg-[#E00000]", textColor: "text-[#E00000]", bgLight: "bg-red-50", border: "border-red-100", hoverBorder: "hover:border-red-300" },
    "claas": { color: "bg-[#00A13A]", textColor: "text-[#00A13A]", bgLight: "bg-green-50", border: "border-green-100", hoverBorder: "hover:border-green-300" },
    "same": { color: "bg-[#FF0000]", textColor: "text-[#FF0000]", bgLight: "bg-red-50", border: "border-red-100", hoverBorder: "hover:border-red-300" },
    "landini": { color: "bg-[#0070B8]", textColor: "text-[#0070B8]", bgLight: "bg-blue-50", border: "border-blue-100", hoverBorder: "hover:border-blue-300" },
    "antonio-carraro": { color: "bg-[#D31245]", textColor: "text-[#D31245]", bgLight: "bg-rose-50", border: "border-rose-100", hoverBorder: "hover:border-rose-300" },
    "kioti": { color: "bg-[#FF6600]", textColor: "text-[#FF6600]", bgLight: "bg-orange-50", border: "border-orange-100", hoverBorder: "hover:border-orange-300" },
    "solis": { color: "bg-[#163884]", textColor: "text-[#163884]", bgLight: "bg-blue-50", border: "border-blue-100", hoverBorder: "hover:border-blue-300" },
};

const DEFAULT_STYLE = {
    color: "bg-gray-600", textColor: "text-gray-600", bgLight: "bg-gray-50", border: "border-gray-200", hoverBorder: "hover:border-gray-300"
};

export default async function TractoresIndexPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch brands
    const { data: brandsData, error } = await supabase
        .from('tractor_brands')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
    const brands = brandsData || [];

    // Render logic
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
                    {brands.map((brand) => {
                        const style = BRAND_STYLES[brand.slug] || DEFAULT_STYLE;
                        return (
                        <Link 
                            key={brand.id} 
                            href={`/tractores/${brand.slug}`}
                            className={`group flex items-center p-6 bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${style.border} ${style.hoverBorder} overflow-hidden relative`}
                        >
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${style.bgLight} transition-transform duration-500 group-hover:scale-[2] -z-10 opacity-50`}></div>
                            
                            <div className={`w-14 h-14 ${style.bgLight} ${style.textColor} rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 relative overflow-hidden`}>
                                <Tractor className="w-7 h-7 relative z-10" />
                            </div>
                            
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-[var(--ag-sys-color-text)] tracking-tight">
                                    {brand.name}
                                </h2>
                                <p className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] mt-0.5">
                                    Ver modelos y catálogos
                                </p>
                            </div>

                            <div className={`w-10 h-10 rounded-full bg-white border ${style.border} flex items-center justify-center text-[var(--ag-sys-color-text-muted)] transition-colors group-hover:${style.color} group-hover:text-white group-hover:border-transparent opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100`}>
                                <ChevronRight className="w-5 h-5 ml-0.5" />
                            </div>
                        </Link>
                    )})}
                </div>
                
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
                
                {/* Bloque SEO Inferior */}
                <div className="mt-16 max-w-4xl mx-auto py-12 border-t border-[var(--ag-sys-color-border)]">
                    <h2 className="text-3xl font-bold text-[var(--ag-sys-color-text)] mb-6">Encuentra el tractor perfecto para tu explotación</h2>
                    <div className="prose prose-lg text-[var(--ag-sys-color-text-muted)]">
                        <p>
                            En Ruralpop hemos creado el catálogo técnico más completo de tractores agrícolas. Tanto si buscas un tractor frutero compacto, como si necesitas la máxima potencia para labores de tiro pesado, aquí encontrarás todas las especificaciones detalladas: potencia en CV, tipo de transmisión, capacidad del depósito, dimensiones, y más.
                        </p>
                        <p>
                            Disponemos de las marcas líderes del mercado como <strong>John Deere, New Holland, Case IH, Fendt, Massey Ferguson, y Kubota</strong>, entre muchas otras. Puedes explorar por marca, revisar los distintos modelos lanzados en las últimas décadas, e incluso descargar los manuales oficiales y catálogos en PDF directamente a tu dispositivo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Refactorizado para leer dinámicamente de 'tractor_brands' (Supabase).
 * - Componente Server-Side, estático con revalidate (ISR) para SEO perfecto sin coste de DB cada hit.
 * - Estilos y colores ampliados para soportar las 16+ marcas del nuevo excel.
 */
