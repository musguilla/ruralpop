import React from "react";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { ArrowLeft, Download, FileText, Tractor, ChevronRight } from "lucide-react";
import { getTractorFormattedName, generateTractorFriendlySlug, TRACTOR_DESCRIPTIONS } from "@/lib/tractores-data";

export const dynamic = "force-dynamic";

const BRANDS_MAP: Record<string, { name: string; color: string; bgLight: string; textColor: string }> = {
    "case": { name: "Case", color: "bg-red-600", bgLight: "bg-red-50", textColor: "text-red-900" },
    "john-deere": { name: "John Deere", color: "bg-[#367C2B]", bgLight: "bg-green-50", textColor: "text-green-900" },
    "lamborghini": { name: "Lamborghini", color: "bg-black", bgLight: "bg-gray-100", textColor: "text-black" },
    "massey-ferguson": { name: "Massey Ferguson", color: "bg-[#C8102E]", bgLight: "bg-red-50", textColor: "text-red-900" },
    "mc-cormick": { name: "Mc Cormick", color: "bg-[#E31837]", bgLight: "bg-red-50", textColor: "text-red-900" },
    "new-holland": { name: "New Holland", color: "bg-[#002B7F]", bgLight: "bg-blue-50", textColor: "text-blue-900" },
};

const FOLDER_NAMES: Record<string, string> = {
    "case": "Case",
    "john-deere": "John Deere",
    "lamborghini": "Lamborghini",
    "massey-ferguson": "Massey Ferguson",
    "mc-cormick": "Mc Cormick",
    "new-holland": "New Holland",
};

type Props = {
    params: Promise<{ brand: string; model: string }>;
};

export async function generateMetadata(props: Props) {
    const { brand: brandSlug, model } = await props.params;
    const brand = BRANDS_MAP[brandSlug];
    const encodedSlug = decodeURIComponent(model); // e.g. "farmall-55-75a"

    if (!brand) return { title: "Modelo no encontrado | Ruralpop" };

    // We do not have the exact name to map right here easily without listing the bucket.
    // For SEO purposes, we will roughly format the slug back to Title case if possible,
    // though ideally the exact string would be best.
    const tentativeTitlePieces = encodedSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1));
    const titleFromSlug = tentativeTitlePieces.join(" ");

    return {
        title: `Tractor ${brand.name} ${titleFromSlug} - Catálogo PDF | Ruralpop`,
        description: `Conoce todos los detalles del ${brand.name} ${titleFromSlug}. Ficha técnica, descripciones y descarga del catálogo oficial en PDF.`,
    };
}

export default async function BrandModelDetail(props: Props) {
    const { brand: brandSlug, model } = await props.params;
    const brandData = BRANDS_MAP[brandSlug];
    const folderName = FOLDER_NAMES[brandSlug];
    const decodedModel = decodeURIComponent(model);

    if (!brandData || !folderName) {
        notFound();
    }

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

    let files: { name: string }[] = [];
    try {
        const { Contents } = await s3Client.send(listCommand);
        if (Contents) {
            files = Contents.map(c => {
                const name = c.Key?.split('/').pop() || "";
                return { name };
            }).filter(f => f.name !== "");
        }
    } catch (err) {
        console.error("Error fetching files from S3:", err);
    }

    if (!files || files.length === 0) {
        notFound();
    }

    let pdfUrl: string | null = null;
    let imageUrl: string | null = null;
    let targetFileName: string | null = null;

    // Identify files matching this slug
    let foundFormattedName = "";
    
    files.forEach(f => {
        if (f.name === ".emptyFolderPlaceholder" || f.name.startsWith(".")) return;
        
        const fName = getTractorFormattedName(f.name);
        if (fName === "__IGNORE__") return;
        
        const fSlug = generateTractorFriendlySlug(fName);

        if (fSlug === decodedModel) {
            foundFormattedName = fName; // Same for all items in this slug
            const ext = f.name.substring(f.name.lastIndexOf(".") + 1).toLowerCase();
            const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL || "https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev";
            const publicUrl = `${r2BaseUrl}/tractores/${encodeURIComponent(folderName)}/${encodeURIComponent(f.name)}`;

            if (ext === 'pdf') {
                pdfUrl = publicUrl;
                // Use the file name as the target to look up description if needed
                if (!targetFileName) targetFileName = f.name;
            } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                imageUrl = publicUrl;
            }
        }
    });

    if (!pdfUrl) {
         notFound(); // If no catalog PDF, 404
    }

    const formattedModelName = foundFormattedName || getTractorFormattedName(targetFileName || "");
    const description = (targetFileName && TRACTOR_DESCRIPTIONS[targetFileName]) || `Explora toda la información, la ficha técnica y la tecnología que ofrece el modelo de tractor ${brandData.name} ${formattedModelName}. Un equipo especialmente diseñado para satisfacer las demandas más exigentes en el campo, maximizar la productividad de la explotación y ofrecer un alto nivel de confort a los operarios.`;

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <Link
                        href={`/tractores/${brandSlug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Volver a {brandData.name}
                    </Link>

                    <Link 
                        href="https://www.ruralpop.com/anuncios-maquinaria" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-[var(--ag-sys-color-primary)] text-sm font-bold rounded-xl border border-green-200/50 hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all shadow-sm"
                    >
                        ¿Buscas tractores de segunda mano?
                        <ChevronRight className="w-4 h-4 opacity-80" />
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-[var(--ag-sys-color-border)] shadow-sm overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left: Content Info */}
                    <div className="flex-1 p-8 sm:p-10 order-2 md:order-1 flex flex-col justify-center">
                        <h1 className="text-3xl sm:text-5xl font-black text-[var(--ag-sys-color-text)] tracking-tight mb-6 leading-tight">
                            {formattedModelName}
                        </h1>

                        <div className="prose prose-lg text-[var(--ag-sys-color-text-muted)] mb-10">
                            <p className="leading-relaxed">
                                {description}
                            </p>
                        </div>

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
                    </div>

                    {/* Right: Cover & UI Element */}
                    <div className={`w-full md:w-2/5 ${brandData.bgLight} border-l border-[var(--ag-sys-color-border)] p-8 sm:p-14 flex items-center justify-center order-1 md:order-2 relative overflow-hidden min-h-[400px]`}>
                         {/* Brand Accent circle back */}
                         <div className={`absolute top-0 right-0 w-64 h-64 rounded-full ${brandData.color} opacity-5 translate-x-1/2 -translate-y-1/2`}></div>
                         <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full ${brandData.color} opacity-5 -translate-x-1/2 translate-y-1/2`}></div>
                         
                         <a 
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 bg-white flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-[var(--ag-sys-color-primary)]/20 block cursor-pointer"
                         >
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={`Portada del catálogo ${formattedModelName}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 h-full w-full">
                                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                                        <FileText className="w-10 h-10 text-red-500" />
                                    </div>
                                    <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Documento Técino sin imagen</span>
                                </div>
                            )}
                            
                            {/* Hover dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Little Top Badge */}
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-md rounded-lg p-2 px-3 border border-white/20 text-xs font-bold text-gray-800 flex items-center gap-1.5 z-10">
                                <FileText className="w-3.5 h-3.5 text-red-500" />
                                PDF
                            </div>
                            
                            {/* Hover download icon indicator */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-[var(--ag-sys-color-primary)] text-white p-4 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                    <Download className="w-8 h-8" />
                                </div>
                            </div>
                         </a>
                    </div>

                </div>
                
                {/* Promo/SEO Banner Bottom */}
                <div className="mt-20 bg-gradient-to-br from-[var(--ag-sys-color-surface)] to-[#059669]/5 rounded-[2rem] p-8 sm:p-12 border border-[var(--ag-sys-color-border)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="max-w-xl text-center md:text-left">
                        <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-2">
                            Busca tu Tractor o vende el actual
                        </h3>
                        <p className="text-[var(--ag-sys-color-text-muted)]">
                            ¿Necesitas renovar la maquinaria? Entra a los anuncios clasificados y compra y vende maquinaria libre de intermediarios.
                        </p>
                    </div>
                    <Link 
                        href="https://www.ruralpop.com/anuncios-maquinaria" 
                        className="px-8 py-4 bg-white border border-[var(--ag-sys-color-border)] text-[var(--ag-sys-color-text)] font-bold rounded-2xl hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm whitespace-nowrap"
                    >
                        <span>Ir a la Zona Maquinaria</span>
                        <ChevronRight className="w-5 h-5 opacity-70" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Esta página de detalle individual mejora drásticamente el SEO largo (Long Tail), cada modelo ahora tiene su URL y metadata específica.
 * - Le pasamos como parámetro la URL encoded del nombre base de archivo que extrajimos en la lista.
 * - Incluímos fallback genérico elegante de texto por si no se especifica descripcion para X modelo.
 */
