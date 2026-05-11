import React from "react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { ArrowLeft, Download, FileText, Tractor, ChevronRight } from "lucide-react";
import { getTractorFormattedName, generateTractorFriendlySlug } from "@/lib/tractores-data";
import { TractorSpecsTable } from "@/components/tractores/TractorSpecsTable";
import { TractorJsonLd } from "@/components/seo/TractorJsonLd";

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
    params: Promise<{ brand: string; model: string }>;
};

export async function generateMetadata(props: Props) {
    const { brand: brandSlug, model: modelSlug } = await props.params;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: brand } = await supabase.from('tractor_brands').select('id, name').eq('slug', brandSlug).single();
    if (!brand) return { title: "Modelo no encontrado | Ruralpop" };

    const { data: model } = await supabase.from('tractor_models').select('name, seo_title, seo_description').eq('brand_id', brand.id).eq('slug', modelSlug).single();

    if (!model) {
        // Podría ser un alias
        const { data: alias } = await supabase.from('tractor_model_aliases').select('model_id').eq('slug', modelSlug).single();
        if (alias) {
            const { data: realModel } = await supabase.from('tractor_models').select('name, seo_title, seo_description').eq('id', alias.model_id).single();
            if (realModel) {
                return {
                    title: realModel.seo_title || `Tractor ${brand.name} ${realModel.name} - Catálogo PDF | Ruralpop`,
                    description: realModel.seo_description || `Conoce todos los detalles del ${brand.name} ${realModel.name}. Ficha técnica, descripciones y descarga del catálogo oficial en PDF.`,
                    alternates: { canonical: `/tractores/${brandSlug}/${modelSlug}` }
                };
            }
        }
        return { title: `Tractor ${brand.name} - Catálogo PDF | Ruralpop` };
    }

    return {
        title: model.seo_title || `Tractor ${brand.name} ${model.name} - Catálogo PDF | Ruralpop`,
        description: model.seo_description || `Conoce todos los detalles del ${brand.name} ${model.name}. Ficha técnica, descripciones y descarga del catálogo oficial en PDF.`,
        alternates: { canonical: `/tractores/${brandSlug}/${modelSlug}` }
    };
}

export default async function BrandModelDetail(props: Props) {
    const { brand: brandSlug, model: modelSlugParam } = await props.params;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    // Fetch brand
    const { data: brandData } = await supabase
        .from('tractor_brands')
        .select('*')
        .eq('slug', brandSlug)
        .single();

    if (!brandData) {
        notFound();
    }
    
    // Fetch model by slug or alias
    let { data: modelData } = await supabase
        .from('tractor_models')
        .select('*')
        .eq('brand_id', brandData.id)
        .eq('slug', modelSlugParam)
        .single();
        
    if (!modelData) {
        // try alias
        const { data: alias } = await supabase
            .from('tractor_model_aliases')
            .select('model_id')
            .eq('slug', modelSlugParam)
            .single();
            
        if (alias) {
            const { data: realModel } = await supabase
                .from('tractor_models')
                .select('*')
                .eq('id', alias.model_id)
                .single();
            if (realModel) {
                modelData = realModel;
            } else {
                notFound();
            }
        } else {
            notFound();
        }
    }

    const style = BRAND_STYLES[brandSlug] || DEFAULT_STYLE;
    const folderName = FOLDER_NAMES[brandSlug];

    // Check S3 for PDF
    let pdfUrl: string | null = null;
    let imageUrl: string | null = null;

    if (folderName && process.env.R2_ACCOUNT_ID) {
        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });

        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME!,
            Prefix: `tractores/${folderName}/`,
        });

        try {
            const { Contents } = await s3Client.send(listCommand);
            if (Contents) {
                // Find matching file
                Contents.forEach(f => {
                    const name = f.Key?.split('/').pop() || "";
                    if (name === ".emptyFolderPlaceholder" || name.startsWith(".")) return;
                    
                    const formattedName = getTractorFormattedName(name);
                    const fileSlug = generateTractorFriendlySlug(formattedName);
                    
                    if (fileSlug === modelData.slug || fileSlug === modelSlugParam) {
                        const ext = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
                        const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL || "https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev";
                        const publicUrl = `${r2BaseUrl}/tractores/${encodeURIComponent(folderName)}/${encodeURIComponent(name)}`;

                        if (ext === 'pdf') {
                            pdfUrl = publicUrl;
                        } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                            imageUrl = publicUrl;
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching files from S3:", err);
        }
    }

    const description = modelData.description || `Explora toda la información, la ficha técnica y la tecnología que ofrece el modelo de tractor ${brandData.name} ${modelData.name}. Un equipo especialmente diseñado para satisfacer las demandas más exigentes en el campo, maximizar la productividad de la explotación y ofrecer un alto nivel de confort a los operarios.`;

    return (
        <>
        <TractorJsonLd 
            brandName={brandData.name}
            modelName={modelData.name}
            description={description}
            image={imageUrl}
            brandUrl={`https://www.ruralpop.com/tractores/${brandData.slug}`}
            modelUrl={`https://www.ruralpop.com/tractores/${brandData.slug}/${modelData.slug}`}
        />
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <Link
                        href={`/tractores/${brandSlug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Volver a {brandData.name}
                    </Link>

                    <Link 
                        href={`/s/tractores-segunda-mano/${brandSlug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-[var(--ag-sys-color-primary)] text-sm font-bold rounded-xl border border-green-200/50 hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all shadow-sm"
                    >
                        ¿Buscas el {modelData.name} de segunda mano?
                        <ChevronRight className="w-4 h-4 opacity-80" />
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row mb-12">
                    
                    {/* Left: Content Info */}
                    <div className="flex-1 p-8 sm:p-10 order-2 md:order-1 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.color} text-white`}>
                                {modelData.series || brandData.name}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-6 leading-tight">
                            Tractor {brandData.name} {modelData.name}
                        </h1>

                        <div className="prose prose-lg text-[var(--ag-sys-color-text-muted)] mb-10">
                            <p className="leading-relaxed">
                                {description}
                            </p>
                        </div>

                        {pdfUrl && (
                            <div className="mt-auto">
                               <a 
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-4 bg-[var(--ag-sys-color-primary)] text-white font-bold rounded-2xl hover:bg-[var(--ag-sys-color-primary-hover)] transition-all shadow-md shadow-[var(--ag-sys-color-primary)]/20 text-lg group"
                               >
                                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                    <span>Descargar Catálogo Oficial (PDF)</span>
                               </a>
                            </div>
                        )}
                    </div>

                    {/* Right: Cover & UI Element */}
                    <div className={`w-full md:w-2/5 ${style.bgLight} border-l border-[var(--ag-sys-color-border)] p-8 sm:p-14 flex items-center justify-center order-1 md:order-2 relative overflow-hidden min-h-[400px]`}>
                         {/* Brand Accent circle back */}
                         <div className={`absolute top-0 right-0 w-64 h-64 rounded-full ${style.color} opacity-5 translate-x-1/2 -translate-y-1/2`}></div>
                         <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full ${style.color} opacity-5 -translate-x-1/2 translate-y-1/2`}></div>
                         
                         {pdfUrl || imageUrl ? (
                            <a 
                                href={pdfUrl || "#"}
                                target={pdfUrl ? "_blank" : undefined}
                                rel={pdfUrl ? "noopener noreferrer" : undefined}
                                className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-white flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-[var(--ag-sys-color-primary)]/20 block cursor-pointer"
                             >
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={`Portada del catálogo ${modelData.name}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 h-full w-full">
                                        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                            <FileText className="w-10 h-10 text-red-500" />
                                        </div>
                                        <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Documento Oficial</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
                                {pdfUrl && (
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-md rounded-lg p-2 px-3 border border-white/20 text-xs font-bold text-gray-800 flex items-center gap-1.5 z-10">
                                        <FileText className="w-3.5 h-3.5 text-red-500" />
                                        PDF
                                    </div>
                                )}
                                
                                {pdfUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-[var(--ag-sys-color-primary)] text-white p-4 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <Download className="w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                             </a>
                         ) : (
                             <div className="relative z-10 opacity-20">
                                 <Tractor style={{ width: '250px', height: '250px', color: 'currentColor' }} className={style.textColor} />
                             </div>
                         )}
                    </div>
                </div>
                
                {/* Specs Table */}
                <TractorSpecsTable model={modelData} />
                
                {/* Promo/SEO Banner Bottom */}
                <div className="mt-20 bg-gradient-to-br from-[var(--ag-sys-color-surface)] to-[#059669]/5 rounded-[2rem] p-8 sm:p-12 border border-[var(--ag-sys-color-border)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="max-w-xl text-center md:text-left">
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-2">
                            Compra y vende maquinaria en Ruralpop
                        </h3>
                        <p className="text-[var(--ag-sys-color-text-muted)]">
                            ¿Necesitas renovar tu tractor? Entra a los anuncios clasificados y compra y vende maquinaria sin intermediarios ni comisiones.
                        </p>
                    </div>
                    <Link 
                        href={`/s/tractores-segunda-mano/${brandSlug}`}
                        className="px-8 py-4 bg-white border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold rounded-2xl hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
                    >
                        <span>Ver tractores {brandData.name} de Ocasión</span>
                        <ChevronRight className="w-5 h-5 opacity-70" />
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Esta página se abastece primero de `tractor_models` para construir un UI de ficha técnica sólida (TractorSpecsTable).
 * - S3 se usa como complemento para inyectar el link de descarga y la portada si existen. Si no existen, muestra un layout abstracto de la marca.
 * - Resuelto alias matching en backend para que enlaces antiguos con nombres compuestos redirijan transparentemente al ID de modelo correcto.
 */
