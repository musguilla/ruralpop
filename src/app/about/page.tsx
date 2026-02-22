"use client";

import React from "react";
import { Info } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Sobre Nosotros</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Nuestra historia y valores en Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        Bienvenido a <strong>Ruralpop</strong>, el mercado digital definitivo diseñado exclusivamente para el sector primario. Nuestra plataforma nace con una misión clara: conectar de forma directa, segura y transparente a agricultores, ganaderos y profesionales del medio rural de toda España.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Nuestra Visión</h3>
                    <p>
                        Creemos que el campo necesita herramientas tecnológicas adaptadas a su realidad cotidiana. Ruralpop no es un mercado generalista; es un espacio acotado donde quien busca una empacadora, paja, un tractor de segunda mano o ganado selecto encuentra exactamente a su interlocutor ideal sin intermediarios abusivos.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">¿Qué nos diferencia?</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Especialización:</strong> Categorías y subcategorías pensadas por y para la gente del campo.</li>
                        <li><strong>Seguridad:</strong> Perfiles verificados y un sistema de chat en tiempo real para negociar en confianza.</li>
                        <li><strong>Sencillez:</strong> Una interfaz moderna pero libre de distracciones, centrada al 100% en el producto.</li>
                    </ul>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">El Futuro</h3>
                    <p>
                        Seguimos iterando Ruralpop semanalmente en contacto directo con nuestros primeros usuarios para añadir nuevas funcionalidades como pagos seguros, alertas de lonjas y mucho más. Únete hoy a la comunidad y sé parte del mayor ecosistema rural de internet.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página puramente informativa de "Sobre nosotros", evitando errores de 404.
 * - Diseño usando el standard card/surface de Antigravity.
 */
