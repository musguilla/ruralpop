import React from "react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, FileText, Tractor, ChevronRight } from "lucide-react";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getTractorFormattedName, generateTractorFriendlySlug } from "@/lib/tractores-data";

export const revalidate = 3600; // Cache 1 hora para SEO

const BRAND_STYLES: Record<string, any> = {
    "case-ih": { color: "bg-red-600", textColor: "text-red-600", bgLight: "bg-red-50" },
    "john-deere": { color: "bg-[#367C2B]", textColor: "text-[#367C2B]", bgLight: "bg-green-50" },
    "lamborghini": { color: "bg-black", textColor: "text-black", bgLight: "bg-gray-100" },
    "massey-ferguson": { color: "bg-[#C8102E]", textColor: "text-[#C8102E]", bgLight: "bg-red-50" },
    "mccormick": { color: "bg-[#E31837]", textColor: "text-[#E31837]", bgLight: "bg-red-50" },
    "new-holland": { color: "bg-[#002B7F]", textColor: "text-[#002B7F]", bgLight: "bg-blue-50" },
    "fendt": { color: "bg-[#006039]", textColor: "text-[#006039]", bgLight: "bg-green-50" },
    "kubota": { color: "bg-[#FF6A00]", textColor: "text-[#FF6A00]", bgLight: "bg-orange-50" },
    "deutz-fahr": { color: "bg-[#91C124]", textColor: "text-[#91C124]", bgLight: "bg-lime-50" },
    "valtra": { color: "bg-[#E00000]", textColor: "text-[#E00000]", bgLight: "bg-red-50" },
    "claas": { color: "bg-[#00A13A]", textColor: "text-[#00A13A]", bgLight: "bg-green-50" },
    "same": { color: "bg-[#FF0000]", textColor: "text-[#FF0000]", bgLight: "bg-red-50" },
    "landini": { color: "bg-[#0070B8]", textColor: "text-[#0070B8]", bgLight: "bg-blue-50" },
    "antonio-carraro": { color: "bg-[#D31245]", textColor: "text-[#D31245]", bgLight: "bg-rose-50" },
    "kioti": { color: "bg-[#FF6600]", textColor: "text-[#FF6600]", bgLight: "bg-orange-50" },
    "solis": { color: "bg-[#163884]", textColor: "text-[#163884]", bgLight: "bg-blue-50" },
};

const DEFAULT_STYLE = { color: "bg-gray-600", textColor: "text-gray-600", bgLight: "bg-gray-50" };

// Map real folder names based on the user's bucket screenshot (Legacy Support)
const FOLDER_NAMES: Record<string, string> = {
    "case-ih": "Case",
    "case": "Case",
    "john-deere": "John Deere",
    "lamborghini": "Lamborghini",
    "massey-ferguson": "Massey Ferguson",
    "mc-cormick": "Mc Cormick",
    "mccormick": "Mc Cormick",
    "new-holland": "New Holland",
};

type Props = {
    params: Promise<{ brand: string }>;
};

// Generate metadata for SEO dynamically based on the brand
export async function generateMetadata(props: Props) {
    const { brand: brandSlug } = await props.params;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: brand } = await supabase.from('tractor_brands').select('name, seo_title, seo_description').eq('slug', brandSlug).single();

    if (!brand) return { title: "Marca no encontrada | Ruralpop" };

    return {
        title: brand.seo_title || `Tractores ${brand.name}: modelos, fichas técnicas y catálogos | Ruralpop`,
        description: brand.seo_description || `Consulta tractores ${brand.name}, modelos, fichas técnicas, potencia, motor, transmisión, catálogos PDF y anuncios de segunda mano en Ruralpop.`,
        alternates: { canonical: `/tractores/${brandSlug}` }
    };
}

export default async function BrandCatalogPage(props: Props) {
    const { brand: brandSlug } = await props.params;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    // Fetch brand from Supabase
    const { data: brandData, error: brandError } = await supabase
        .from('tractor_brands')
        .select('*')
        .eq('slug', brandSlug)
        .single();

    if (brandError || !brandData) {
        notFound();
    }
    
    // Fetch models from Supabase
    const { data: modelsData, error: modelsError } = await supabase
        .from('tractor_models')
        .select('*, tractor_model_aliases(slug)')
        .eq('brand_id', brandData.id)
        .eq('is_active', true)
        .order('power_hp_min', { ascending: true, nullsFirst: false });
        
    const models = modelsData || [];
    const style = BRAND_STYLES[brandSlug] || DEFAULT_STYLE;
    const folderName = FOLDER_NAMES[brandSlug];

    // Check S3 for legacy PDFs
    let s3ItemsMap = new Map<string, { pdfUrl: string | null, imageUrl: string | null }>();
    if (folderName && process.env.R2_ACCOUNT_ID) {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });

        try {
            const { Contents } = await s3Client.send(new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME!,
                Prefix: `tractores/${folderName}/`,
            }));
            
            if (Contents) {
                Contents.forEach(c => {
                    const name = c.Key?.split('/').pop() || "";
                    if (name === ".emptyFolderPlaceholder" || name.startsWith(".")) return;
                    
                    const formattedName = getTractorFormattedName(name);
                    if (formattedName === "__IGNORE__") return;

                    const friendlySlug = generateTractorFriendlySlug(formattedName);
                    
                    if (!s3ItemsMap.has(friendlySlug)) {
                        s3ItemsMap.set(friendlySlug, { pdfUrl: null, imageUrl: null });
                    }

                    const item = s3ItemsMap.get(friendlySlug)!;
                    const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL || "https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev";
                    const publicUrl = `${r2BaseUrl}/tractores/${encodeURIComponent(folderName)}/${encodeURIComponent(name)}`;
                    const extension = name.substring(name.lastIndexOf(".") + 1).toLowerCase();

                    if (extension === "pdf") {
                        item.pdfUrl = publicUrl;
                    } else if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
                        item.imageUrl = publicUrl;
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching files from S3:", err);
        }
    }

    // Merge S3 data with DB models
    // Since some legacy S3 files might not have matched a DB model perfectly, we display DB models first.
    // If we want to show PDFs that don't match any DB model, we can append them.
    
    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <Link
                        href="/tractores"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Volver a marcas
                    </Link>
                </div>

                {/* Brand Header */}
                <div className={`relative overflow-hidden rounded-[2.5rem] ${style.bgLight} border border-black/5 p-8 sm:p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8`}>
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <h1 className={`text-4xl sm:text-6xl font-black ${style.textColor} tracking-tight mb-4`}>
                            Tractores {brandData.name}
                        </h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] sm:text-lg max-w-3xl leading-relaxed mx-auto md:mx-0">
                            {brandData.short_description || `Colección completa de fichas técnicas, características y catálogos en PDF. Descubre todos los detalles, potencia y tecnología de los tractores ${brandData.name}.`}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                            <div className="bg-white/60 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-white/40">
                                {models.length} modelos documentados
                            </div>
                            {brandData.founded_year && (
                                <div className="bg-white/60 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-white/40">
                                    Fundada en {brandData.founded_year}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Decorative oversized icon */}
                    <div className="opacity-10 absolute right-[-5%] top-[10%] pointer-events-none select-none hidden md:block">
                        <Tractor style={{ width: '400px', height: '400px', color: 'currentColor' }} className={style.textColor} />
                    </div>
                </div>

                {/* Models Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-6">
                        Modelos y Series {brandData.name}
                    </h2>

                    {models.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-[var(--ag-sys-color-text-muted)]">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-bold">Aún no hay modelos sincronizados para {brandData.name}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {models.map((model) => {
                                // Check if we have S3 legacy media for this model
                                let s3Media = s3ItemsMap.get(model.slug);
                                if (!s3Media && model.tractor_model_aliases) {
                                    // check aliases
                                    for (const alias of model.tractor_model_aliases) {
                                        if (s3ItemsMap.has(alias.slug)) {
                                            s3Media = s3ItemsMap.get(alias.slug);
                                            break;
                                        }
                                    }
                                }
                                
                                return (
                                <Link 
                                    key={model.id}
                                    href={`/tractores/${brandSlug}/${model.slug}`}
                                    className="group flex flex-col bg-white rounded-3xl border border-[var(--ag-sys-color-border)] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block h-full focus:outline-none focus:ring-4 focus:ring-[var(--ag-sys-color-primary)]/20"
                                >
                                    {/* Abstract header for model card based on specs */}
                                    <div className={`relative w-full p-6 pb-12 overflow-hidden flex flex-col ${style.bgLight} border-b border-[var(--ag-sys-color-border)]`}>
                                        <div className="flex justify-between items-start z-10">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/50 px-2 py-1 rounded-lg">
                                                    {model.series || "Tractor"}
                                                </span>
                                            </div>
                                            {s3Media?.pdfUrl && (
                                                <div className="bg-white/90 backdrop-blur-sm text-red-600 p-1.5 rounded-lg shadow-sm border border-white/20">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h3 className={`mt-4 font-black text-2xl ${style.textColor} leading-tight line-clamp-2 z-10`}>
                                            {model.name}
                                        </h3>
                                        
                                        {/* Background icon */}
                                        <Tractor className="absolute -bottom-6 -right-4 w-32 h-32 opacity-5" />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between bg-white relative">
                                        <div className="space-y-3 mb-4">
                                            {model.power_hp_min ? (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Potencia</span>
                                                    <span className="font-bold text-gray-800">
                                                        {model.power_hp_min} {model.power_hp_max && model.power_hp_max !== model.power_hp_min ? `- ${model.power_hp_max}` : ''} CV
                                                    </span>
                                                </div>
                                            ) : null}
                                            {model.engine ? (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Motor</span>
                                                    <span className="font-bold text-gray-800 line-clamp-1 text-right max-w-[60%]">{model.engine}</span>
                                                </div>
                                            ) : null}
                                            {model.transmission ? (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Transmisión</span>
                                                    <span className="font-bold text-gray-800 line-clamp-1 text-right max-w-[60%]">{model.transmission}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-[var(--ag-sys-color-border)] flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ag-sys-color-primary)] bg-[var(--ag-sys-color-primary)]/10 py-1 px-2 rounded-lg">
                                                Ver Ficha
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--ag-sys-color-primary)] transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SEO Text Block */}
                {brandData.long_description && (
                    <div className="mt-8 mb-12 py-12 border-t border-[var(--ag-sys-color-border)] max-w-4xl">
                        <h2 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-4">
                            Acerca de los tractores {brandData.name}
                        </h2>
                        <div className="prose prose-lg text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            <p>{brandData.long_description}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Esta página ahora lee de `tractor_models` para generar la galería completa de fichas, haya o no PDF en S3.
 * - S3 solo se lee como *enrichment* (si tiene un PDF subido históricamente, le añade un icono de documento a la ficha).
 * - UI Glassmorphism adaptada a no requerir imagen obligatoriamente, generando un "Header" abstracto con el color corporativo.
 */
