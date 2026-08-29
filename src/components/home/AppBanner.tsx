import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerTenantSlug } from "@/utils/tenant/server";

export async function AppBanner() {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const brandName = isEquipop ? 'Equipop' : 'Ruralpop';
    const brandColor = isEquipop ? 'bg-blue-50' : 'bg-green-50'; // Usamos bg-green-50 para el fondeado verde claro, o el de tailwind

    return (
        <section id="app" className={`w-full mt-12 mb-16 rounded-[2rem] overflow-hidden ${brandColor} relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm border border-[var(--ag-sys-color-border)]`}>
            {/* Elemento decorativo de fondo opcional similar a la curva de Milanuncios */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full text-[var(--ag-sys-color-primary)]">
                    <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="z-10 flex flex-col md:w-3/5 text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Descarga ya la app de {brandName}
                </h2>
                <p className="text-lg text-slate-700 mb-8 max-w-lg">
                    Chatea, crea tus búsquedas y publica más rápido y fácil desde la app.
                </p>
                <div className="flex flex-row items-center justify-center md:justify-start gap-4">
                    <Link href="https://play.google.com/store/apps/details?id=com.ruralpop.app&hl=es" target="_blank" rel="noopener noreferrer">
                        <img src="/google-play-logo.svg" alt="Disponible en Google Play" className="h-10 md:h-12 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                    <Link href="https://apps.apple.com/es/app/ruralpop-vende-y-compra/id6759678666" target="_blank" rel="noopener noreferrer">
                        <img src="/app-store-logo.svg" alt="Consíguelo en el App Store" className="h-10 md:h-12 w-auto object-contain hover:scale-105 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="z-10 flex items-center md:w-2/5 justify-center md:justify-end gap-6">
                <div className="hidden lg:flex flex-col items-end text-slate-800 rotate-[-4deg] mr-2">
                    <span className="font-['Kalam',_cursive] text-2xl mb-1">Escanea el</span>
                    <span className="font-['Kalam',_cursive] text-2xl">código y ¡listo!</span>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-2 text-slate-600 rotate-[45deg]">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                    </svg>
                </div>
                <div className="bg-white p-4 rounded-3xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <Image 
                        src="/qr-app.png" 
                        alt={`Código QR para descargar la app de ${brandName}`} 
                        width={140} 
                        height={140} 
                        className="rounded-xl"
                        unoptimized
                    />
                </div>
            </div>
        </section>
    );
}
