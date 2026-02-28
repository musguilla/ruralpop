import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    return {
        title: "El futuro de la maquinaria rural | Ruralpop Magazine",
        description: "Ejemplo de artículo premium en la revista del entorno agrícola.",
    };
}

export default function MagazineArticlePage({ params }: { params: { slug: string } }) {
    return (
        <article className="min-h-screen bg-[var(--ag-sys-color-surface)] pb-24">
            {/* Header / Intro */}
            <div className="w-full relative h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1542841432-849ee9db4f33?q=80&w=2670&auto=format&fit=crop"
                    alt="Artículo Cover"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-8 left-4 md:left-8 z-10">
                    <Link
                        href="/magazine"
                        className="flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-md transition-colors font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver a Magazine
                    </Link>
                </div>

                <div className="absolute bottom-10 left-0 w-full px-4">
                    <div className="container mx-auto max-w-4xl flex flex-col gap-4">
                        <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">Tendencias</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
                            El auge de la robótica en la ganadería intensiva española en 2026
                        </h1>
                        <div className="flex items-center gap-4 text-white/80 text-sm font-medium mt-2">
                            <span>Por Equipo Editorial Ruralpop</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>28 Feb 2026</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            <span>5 min lectura</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-4 mt-12 max-w-3xl">
                <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-[var(--ag-sys-color-primary)] max-w-none text-[var(--ag-sys-color-text)]">
                    <p className="lead text-xl md:text-2xl text-[var(--ag-sys-color-text-muted)] font-medium mb-8">
                        La automatización ya no es ciencia ficción. Las grandes explotaciones y las cooperativas agrarias están adoptando la tecnología a un ritmo frenético para contrarrestar la falta de mano de obra y maximizar la rentabilidad de las cosechas.
                    </p>

                    <h2>1. Sensores IoT en los pastos</h2>
                    <p>
                        Se acabaron los días en los que el conteo de cabezas llevaba horas. Los modernos collares inteligentes registran pulsaciones, temperatura corporal y coordenadas GPS en tiempo real. Esto permite a los veterinarios identificar enfermedades semanas antes de que muestren síntomas físicos avanzados.
                    </p>

                    <figure className="my-10">
                        <Image
                            src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=2674&auto=format&fit=crop"
                            alt="Ganadería inteligente"
                            width={1200}
                            height={800}
                            className="w-full rounded-2xl shadow-md object-cover"
                        />
                        <figcaption className="text-center text-sm text-[var(--ag-sys-color-text-muted)] mt-3">Collares sensores implementados en granjas piloto de Cantabria.</figcaption>
                    </figure>

                    <h2>2. Cosechadoras autónomas</h2>
                    <p>
                        Con la última actualización de algoritmos de navegación geo-espacial, los tractores pueden operar durante 24 horas ininterrumpidas por los surcos sin dañar el terreno. "El ahorro en gasóleo por rutas hiper-optimizadas paga la maquinaria sola en tres campañas", relata Javier Martínez, agricultor de Castilla y León.
                    </p>

                    <h3>Nuevas subvenciones disponibles</h3>
                    <p>
                        Afortunadamente, los ministerios autonómicos han habilitado nuevas partidas del fondo Feder destinadas explícitamente a la digitalización del sector primario. Puedes encontrar subastas de maquinaria de este tipo en nuestra sección de <strong>Compraventa</strong> con sellos de garantía extendida.
                    </p>

                    <blockquote className="border-l-4 border-[var(--ag-sys-color-primary)] pl-6 py-2 my-8 italic text-2xl text-[var(--ag-sys-color-text)]">
                        "En 10 años, quien no haya digitalizado sus fincas no podrá ser competitivo. El momento de invertir es ahora."
                    </blockquote>

                    <h2>Conclusiones</h2>
                    <p>
                        El sector rural no está obsoleto; está a la vanguardia silenciosa de la revolución robótica. La unión de experiencia generacional con inteligencia artificial promete el período de mayor eficiencia de la historia agrícola nacional.
                    </p>
                </div>

                {/* Tags / Share Actions */}
                <div className="mt-16 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-[var(--ag-sys-color-surface-sunken)] rounded-md text-sm border border-[var(--ag-sys-color-border)]">Tecnología</span>
                        <span className="px-3 py-1 bg-[var(--ag-sys-color-surface-sunken)] rounded-md text-sm border border-[var(--ag-sys-color-border)]">Ganadería</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

/**
 * Memoria:
 * - Diseño enriquecido (rich-text format) simulando un headless CMS. 
 * - Encabezado 'Hero Article' que usa la portada en fullscreen.
 * - Utilizado Tailwind Typography style via clases comunes.
 */
