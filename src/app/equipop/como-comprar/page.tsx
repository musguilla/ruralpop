import React from "react";
import { ShoppingCart, Search, MessageCircle, CreditCard, PackageCheck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "¿Cómo comprar? | Equipop",
    description: "Aprende cómo comprar material ecuestre de segunda mano en Equipop de forma fácil y segura.",
};

export default function ComoComprarPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-10 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">¿Cómo comprar?</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-2 font-medium text-lg">Encuentra todo lo que necesitas para ti y tu caballo</p>
                    </div>
                </header>

                <div className="space-y-10">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            1
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <Search className="w-5 h-5 text-emerald-600" />
                                Busca y encuentra
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Explora miles de artículos ecuestres en nuestras categorías. Desde sillas de montar hasta botas y cascos, usa nuestro buscador y los filtros para encontrar exactamente lo que necesitas.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            2
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <MessageCircle className="w-5 h-5 text-emerald-600" />
                                Contacta al vendedor
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                ¿Tienes dudas sobre la talla o el estado del producto? Utiliza el chat integrado para hablar directamente con el vendedor, pedirle más fotos o acordar detalles del envío.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xl">
                            3
                        </div>
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-[var(--ag-sys-color-text)]">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                                Compra con Pago Seguro
                            </h3>
                            <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                                Dale al botón de "Comprar" y utiliza nuestra pasarela de Pago Seguro. Tu dinero estará protegido en todo momento hasta que recibas y compruebes el artículo en persona.
                            </p>
                        </div>
                    </div>


                </div>
                
                <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 text-center border border-emerald-100 dark:border-emerald-900/30">
                    <h3 className="text-2xl font-bold text-[var(--ag-sys-color-text)] mb-4">¿Todo listo para encontrar lo que buscas?</h3>
                    <p className="text-[var(--ag-sys-color-text-muted)] mb-6 max-w-xl mx-auto">Únete a nuestra comunidad y encuentra el mejor equipamiento ecuestre de segunda mano con total seguridad.</p>
                    <a href="/" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
                        Explorar anuncios
                    </a>
                </div>

            </div>
            {/* 
              Documentación de Memoria:
              - Se implementa una vista atractiva basada en pasos, similar al diseño de guías paso a paso.
              - Iconos temáticos para enriquecer el contexto.
            */}
        </div>
    );
}
