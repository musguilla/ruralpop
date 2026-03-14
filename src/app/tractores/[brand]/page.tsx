import React from "react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, FileText, Tractor, ChevronRight } from "lucide-react";
import { SPECIFIC_TRACTOR_NAMES } from "@/lib/tractores-data";

export const dynamic = "force-dynamic";

const BRANDS_MAP: Record<string, { name: string; color: string; bgLight: string; textColor: string }> = {
    "case": { name: "Case", color: "bg-red-600", bgLight: "bg-red-50", textColor: "text-red-900" },
    "john-deere": { name: "John Deere", color: "bg-[#367C2B]", bgLight: "bg-green-50", textColor: "text-green-900" },
    "lamborghini": { name: "Lamborghini", color: "bg-black", bgLight: "bg-gray-100", textColor: "text-black" },
    "massey-ferguson": { name: "Massey Ferguson", color: "bg-[#C8102E]", bgLight: "bg-red-50", textColor: "text-red-900" },
    "mc-cormick": { name: "Mc Cormick", color: "bg-[#E31837]", bgLight: "bg-red-50", textColor: "text-red-900" },
    "new-holland": { name: "New Holland", color: "bg-[#002B7F]", bgLight: "bg-blue-50", textColor: "text-blue-900" },
};


type Props = {
    params: Promise<{ brand: string }>;
};

// Generate metadata for SEO dynamically based on the brand
export async function generateMetadata(props: Props) {
    const { brand: brandSlug } = await props.params;
    const brand = BRANDS_MAP[brandSlug];

    if (!brand) return { title: "Catálogos no encontrados | Ruralpop" };

    return {
        title: `Catálogos y Fichas Técnicas de Tractores ${brand.name} | Ruralpop`,
        description: `Descarga gratis en PDF todos los catálogos oficiales, manuales y especificaciones técnicas de los modelos de tractores ${brand.name}.`,
    };
}

// Map real folder names based on the user's bucket screenshot 
const FOLDER_NAMES: Record<string, string> = {
    "case": "Case",
    "john-deere": "John Deere",
    "lamborghini": "Lamborghini",
    "massey-ferguson": "Massey Ferguson",
    "mc-cormick": "Mc Cormick",
    "new-holland": "New Holland",
};

interface CatalogItem {
    name: string; // Generic name without extension (e.g. "Tractor Series 1")
    pdfUrl: string | null;
    imageUrl: string | null;
}

export default async function BrandCatalogPage(props: Props) {
    const { brand: brandSlug } = await props.params;
    const brandData = BRANDS_MAP[brandSlug];
    const folderName = FOLDER_NAMES[brandSlug];

    if (!brandData || !folderName) {
        notFound();
    }

    // Use service role to bypass any missing RLS SELECT policies on storage.objects for anonymous users
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // List all files in the brand folder
    const { data: files, error } = await supabase.storage
        .from("tractores")
        .list(folderName, {
            limit: 200,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

    if (error) {
        console.error("Error fetching files from storage:", error);
    }

    // Group files by base name (without extension)
    const itemsMap = new Map<string, CatalogItem>();

    files?.forEach((file: { name: string }) => {
        // Skip hidden files or empty placeholders
        if (file.name === ".emptyFolderPlaceholder" || file.name.startsWith(".")) return;

        const lastDotIndex = file.name.lastIndexOf(".");
        if (lastDotIndex === -1) return; // Skip files without extension

        const baseName = file.name.substring(0, lastDotIndex);
        const extension = file.name.substring(lastDotIndex + 1).toLowerCase();

        if (!itemsMap.has(baseName)) {
            itemsMap.set(baseName, { name: baseName, pdfUrl: null, imageUrl: null });
        }

        const item = itemsMap.get(baseName)!;
        const publicUrl = supabase.storage.from("tractores").getPublicUrl(`${folderName}/${file.name}`).data.publicUrl;

        if (extension === "pdf") {
            item.pdfUrl = publicUrl;
        } else if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
            item.imageUrl = publicUrl;
        }
    });

    // Convert map to array and only keep those that have at least a PDF
    const catalogs = Array.from(itemsMap.values()).filter(item => item.pdfUrl !== null);

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/tractores"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group mb-8"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Volver a marcas
                </Link>

                {/* Brand Header */}
                <div className={`relative overflow-hidden rounded-[2.5rem] ${brandData.bgLight} border border-black/5 p-8 sm:p-14 mb-12 flex flex-col md:flex-row items-center justify-between gap-8`}>
                    <div className="relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-black uppercase tracking-widest text-[#059669] shadow-sm mb-6">
                            <Tractor className="w-4 h-4" />
                            Biblioteca Oficial
                        </div>
                        <h1 className={`text-4xl sm:text-6xl font-black ${brandData.textColor} tracking-tight mb-4`}>
                            {brandData.name}
                        </h1>
                        <p className="text-lg text-[var(--ag-sys-color-text-muted)] max-w-xl font-medium">
                            Colección completa de catálogos y fichas técnicas en PDF. Descubre todos los detalles, potencia y tecnología de los tractores {brandData.name}.
                        </p>
                    </div>

                    {/* Decorative oversized icon */}
                    <div className="opacity-10 absolute right-[-5%] top-[10%] pointer-events-none select-none hidden md:block">
                        <Tractor style={{ width: '400px', height: '400px', color: 'currentColor' }} className={brandData.textColor} />
                    </div>
                </div>

                {/* PDF Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-6">
                        Catálogos Disponibles ({catalogs.length})
                    </h2>

                    {catalogs.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-[var(--ag-sys-color-text-muted)]">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-bold">Aún no hay catálogos subidos para {brandData.name}</p>
                            <p className="text-sm mt-1">Vuelve a visitarnos pronto o revisa otra marca.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {catalogs.map((catalog) => (
                                <Link 
                                    key={catalog.name}
                                    href={`/tractores/${brandSlug}/${encodeURIComponent(catalog.name)}`}
                                    className="group flex flex-col bg-white rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block h-full focus:outline-none focus:ring-4 focus:ring-[var(--ag-sys-color-primary)]/20"
                                >
                                    <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden flex items-center justify-center border-b border-[var(--ag-sys-color-border)]">
                                        {catalog.imageUrl ? (
                                            <Image 
                                                src={catalog.imageUrl} 
                                                alt={`Portada del catálogo ${catalog.name}`} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
                                                    <span className="text-red-500 font-black text-2xl">PDF</span>
                                                </div>
                                                <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Sin portada</span>
                                            </div>
                                        )}
                                        {/* Overlay shadow for image */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        {/* Hover download icon bubble */}
                                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[var(--ag-sys-color-text)] p-3 rounded-2xl shadow-lg border border-white/20 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <Download className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                                        <h3 className="font-bold text-lg text-[var(--ag-sys-color-text)] leading-tight line-clamp-3 pr-8">
                                            {(() => {
                                                // Specific exact match override (ignoring spaces if any)
                                                if (SPECIFIC_TRACTOR_NAMES[catalog.name]) {
                                                    return SPECIFIC_TRACTOR_NAMES[catalog.name];
                                                }

                                                let cleaned = catalog.name.replace(/[-_]/g, ' ');
                                                cleaned = cleaned.replace(/\b(tractor|tractores|folleto|catalogo|ficha|tecnica)\b/gi, '');
                                                const parts = cleaned.split(" ").filter(Boolean);
                                                // Remove ugly hash prefixes (usually 8-15 mixed alhpanumeric at the start)
                                                if (parts.length > 1 && /^[a-z0-9]{8,15}$/i.test(parts[0]) && /\d/.test(parts[0]) && /[a-z]/i.test(parts[0])) {
                                                    parts.shift();
                                                }
                                                return parts.map(w => w.toUpperCase()).join(" ") || "CATÁLOGO";
                                            })()}
                                        </h3>
                                        
                                        <div className="mt-4 pt-4 border-t border-[var(--ag-sys-color-border)] flex items-center justify-between">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${brandData.textColor} bg-opacity-10 py-1 px-2 rounded-lg`}>
                                                Ficha Técnica • PDF
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#059669] transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Esta página es completamente dinámica, no necesita compilación si se añaden nuevos PDFs en el futuro.
 * - Leemos el Storage de Supabase, macheando la imagen JPG con su PDF equivalente basándonos en si el "basename" coincide.
 * - Aspect-Ratio [3/4] puro para simular la forma vertical clásica de los catálogos en papel estandarizados.
 * - Optimizamos las imágenes leídas del Storage con `next/image` directamente.
 * - UI Glassmorphism en el icono hover de descarga (bottom right) para que se sienta muy moderno y fluido.
 */
