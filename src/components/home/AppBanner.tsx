import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerTenantSlug } from "@/utils/tenant/server";
import { headers } from "next/headers";

export async function AppBanner() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brandName = isEquipop ? 'Equipop' : 'Ruralpop';
    
    const headersList = await headers();
    const locale = headersList.get('x-locale') || 'es';
    const isPt = locale === 'pt';
    
    const bgColor = isEquipop ? 'bg-blue-50' : 'bg-[#f4fcf7]';

    return (
        <section id="app" className={`w-full ${bgColor} mt-4 mb-12 rounded-2xl border border-gray-200 overflow-hidden`}>
            <div className="px-6 pt-8 md:px-12 md:pt-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 md:gap-4">
                
                {/* Lado izquierdo: Textos y botones */}
                <div className="flex flex-col text-center md:text-left z-10 w-full md:w-[45%] lg:w-[45%] pb-8 md:pb-12 md:self-center">
                    <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] leading-tight font-medium text-slate-900 mb-4 tracking-tight">
                        {isPt ? "Descarrega agora a" : "Descarga ahora la"}<br />
                        app {isPt ? "da" : "de"} <strong className="font-extrabold">{brandName}</strong>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-700 mb-8 font-light">
                        {isPt ? (
                            <>Usa o chat, guarda os teus favoritos e publica <br className="hidden md:block" /> mais rápido através do teu telemóvel.</>
                        ) : (
                            <>Chatea, guarda tus favoritos, y publica <br className="hidden md:block" /> más rápido desde tu móvil.</>
                        )}
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
                <div className="z-10 flex items-end justify-end w-full md:w-[55%] lg:w-[55%] pt-4 md:pt-0">
                    <Image 
                        src={isPt ? "/descargar-app-ruralpop-pt.jpg" : "/descargar-app-ruralpop.jpg"} 
                        alt={isPt ? `Lê o código para descarregar a app da ${brandName}` : `Escanea para descargar la app de ${brandName}`}
                        width={900}
                        height={600}
                        className="w-[110%] max-w-[800px] h-auto object-contain mix-blend-multiply translate-y-[1px] origin-bottom-right"
                        priority
                        unoptimized
                    />
                </div>

            </div>
        </section>
    );
}
