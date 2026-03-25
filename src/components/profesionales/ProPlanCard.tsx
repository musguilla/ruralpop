"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

export function ProPlanCard({ isGhostClaim }: { isGhostClaim: boolean }) {
    // Estado para controlar el tipo de pago: mensual (por defecto) o anual
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <div className={`bg-[var(--ag-sys-color-primary)] rounded-[2.5rem] p-8 lg:p-10 border border-[var(--ag-sys-color-primary)] shadow-2xl relative flex flex-col transform ${isGhostClaim ? '' : 'md:-translate-y-4'}`}>
            {/* Etiqueta superior */}
            {!isGhostClaim && (
                <div className="absolute top-0 right-8 -mt-4 bg-white text-[var(--ag-sys-color-primary)] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-20">
                    El más popular
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>

            <div className="mb-6 relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
                    Plan Pro <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </h3>
                <p className="text-white/80 text-sm">
                    El arma definitiva para vender más si eres empresa del sector, ganadería, concesionario de maquinaria, criadores, ...
                </p>
            </div>

            {/* Toggle Anual / Mensual */}
            <div className="relative z-10 flex flex-col items-start gap-4 mb-6 pt-2 pb-2">
                <div className="relative inline-flex bg-white/20 p-1 rounded-2xl">
                    <button 
                        onClick={() => setIsAnnual(false)} 
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${!isAnnual ? 'bg-white text-[var(--ag-sys-color-primary)] shadow' : 'text-white hover:bg-white/10'}`}
                    >
                        Mensual
                    </button>
                    <button 
                        onClick={() => setIsAnnual(true)} 
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-[var(--ag-sys-color-primary)] shadow' : 'text-white hover:bg-white/10'}`}
                    >
                        Anual <span className="text-[10px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-md leading-none uppercase tracking-wider font-black">-25%</span>
                    </button>

                    {/* Flecha Handwriting (solo visible en desktop o si hay espacio) */}
                    <div className="absolute -right-[110px] -top-8 pointer-events-none opacity-90 hidden sm:flex flex-col items-center transform rotate-6">
                        <span className="text-amber-300 text-sm font-bold font-serif italic mb-1 drop-shadow-md">¡Mejor opción!</span>
                        <svg width="50" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="text-amber-300 drop-shadow-md transform -scale-x-100 rotate-12">
                            <path d="M90 10 Q 50 10 20 60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M20 60 L 40 50 M20 60 L 30 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="mb-8 relative z-10 transition-all duration-300 ease-in-out">
                {isAnnual ? (
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-amber-300 tracking-tighter">450 €</span>
                            <span className="text-white/80 font-medium">/año</span>
                        </div>
                        <p className="text-xs text-amber-100 font-bold mt-2 uppercase tracking-wide">Descuento 25% aplicado (equivale a 37,50€/mes)</p>
                        <p className="text-xs text-white/70 mt-1">IVA incluido. Pago único anual.</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter">49,99 €</span>
                            <span className="text-white/80 font-medium">/mes</span>
                        </div>
                        <p className="text-xs text-white/70 mt-2">IVA incluido. Cancela cuando quieras.</p>
                    </div>
                )}
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative z-10">
                <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-medium">Hasta <strong className="text-amber-300 font-bold">50 anuncios</strong> activos simultáneos</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-medium">Página web pública de tu empresa con todos tus productos, logotipo y descripción.</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-medium">Sello <strong className="text-amber-300 font-bold">Profesional Verificado</strong> en tu perfil</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-medium"><strong className="text-amber-300 font-bold">6 impulsos</strong> de subida de anuncio al mes incluidos</span>
                </li>
                <li className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-medium"><strong className="text-amber-300 font-bold">2 anuncios destacados</strong> en página principal</span>
                </li>
            </ul>

            <Link href={`/profesionales/checkout/pro?${isGhostClaim ? 'ghost_claim=true&' : ''}${isAnnual ? 'interval=year' : 'interval=month'}`} className="mt-auto relative z-10 w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-[var(--ag-sys-color-primary)] font-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                <Zap className="w-5 h-5" />
                {isGhostClaim ? 'Activar Plan PRO' : 'Quiero el PRO'}
            </Link>
        </div>
    );
}
