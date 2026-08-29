import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerTenantSlug } from "@/utils/tenant/server";

export async function AppBanner() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brandName = isEquipop ? 'Equipop' : 'Ruralpop';
    
    // Fondo a sangre (full-width) solicitado: #f4fcf7
    const bgColor = isEquipop ? 'bg-blue-50' : 'bg-[#f4fcf7]';

    return (
        <section id="app" className={`relative w-screen ml-[calc(-50vw+50%)] ${bgColor} mt-12 mb-16 border-y border-black/5`}>
            {/* Contenedor interior centrado con el resto del contenido */}
            <div className="container mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
                
                {/* Lado izquierdo: Textos y botones */}
                <div className="flex flex-col text-center md:text-left z-10 max-w-xl">
                    <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] leading-tight font-medium text-slate-900 mb-4 tracking-tight">
                        Descarga ya la app de <strong className="font-extrabold">{brandName}</strong>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-700 mb-8 font-light">
                        Chatea, guarda tus favoritos, y publica más rápido desde tu móvil.
                    </p>
                    <div className="flex flex-row items-center justify-center md:justify-start gap-4">
                        <Link href="https://play.google.com/store/apps/details?id=com.ruralpop.app&hl=es" target="_blank" rel="noopener noreferrer">
                            <img src="/google-play-logo.svg" alt="Disponible en Google Play" className="h-12 md:h-14 w-auto object-contain hover:scale-105 transition-transform" />
                        </Link>
                        <Link href="https://apps.apple.com/es/app/ruralpop-vende-y-compra/id6759678666" target="_blank" rel="noopener noreferrer">
                            <img src="/app-store-logo.svg" alt="Consíguelo en el App Store" className="h-12 md:h-14 w-auto object-contain hover:scale-105 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Lado derecho: Imagen unificada proporcionada por el usuario */}
                <div className="z-10 flex items-center justify-center w-full md:w-[500px]">
                    <Image 
                        src="/descargar-app-ruralpop.jpg" 
                        alt={`Escanea para descargar la app de ${brandName}`}
                        width={600}
                        height={400}
                        className="w-full h-auto object-contain mix-blend-multiply"
                        priority
                        unoptimized
                    />
                </div>

            </div>
        </section>
    );
}
