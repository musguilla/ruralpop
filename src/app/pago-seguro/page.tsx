import React from "react";
import { ShieldCheck, Lock, Truck, ThumbsUp } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pago Seguro | Equipop",
    description: "Conoce cómo funciona el sistema de Pago Seguro en Equipop para proteger tus transacciones.",
};

export default function PagoSeguroPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-10 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Pago Seguro</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-2 font-medium text-lg">Tu dinero protegido en cada transacción</p>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-[var(--ag-sys-color-border)]">
                        <Lock className="w-10 h-10 text-amber-500 mb-4" />
                        <h3 className="text-xl font-bold mb-3 text-[var(--ag-sys-color-text)]">Dinero retenido y protegido</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            Cuando realizas una compra, tu dinero no va directamente al vendedor. Lo guardamos de manera segura en un depósito hasta que recibas tu artículo y compruebes que todo está en orden.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-[var(--ag-sys-color-border)]">
                        <Truck className="w-10 h-10 text-amber-500 mb-4" />
                        <h3 className="text-xl font-bold mb-3 text-[var(--ag-sys-color-text)]">Envío integrado</h3>
                        <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            Al usar Pago Seguro, el sistema de envíos está completamente integrado. Podrás seguir el trayecto de tu paquete en todo momento desde la aplicación, sin perder de vista tu pedido.
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-[var(--ag-sys-color-border)] md:col-span-2">
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <ThumbsUp className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-[var(--ag-sys-color-text)]">Garantía de satisfacción</h3>
                                <p className="text-[var(--ag-sys-color-text-muted)] leading-relaxed text-lg">
                                    Tienes 48 horas tras recibir el paquete para comprobar que el material está tal y como se describía en el anuncio. Si hay algún problema (el artículo está dañado, no es el acordado), el dinero no se liberará al vendedor y se mediará para buscar una solución o una devolución. ¡Cero riesgos!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* 
              Documentación de Memoria:
              - Se implementa una vista enfocada en la confianza, destacando las garantías mediante un layout en grid.
              - Colores cálidos (amber) y de validación (emerald) para evocar seguridad.
            */}
        </div>
    );
}
