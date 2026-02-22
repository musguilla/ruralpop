"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Política de Privacidad</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Cómo manejamos tus datos</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        En <strong>Ruralpop</strong>, entendemos que la privacidad de la información personal de nuestros usuarios (en adelante, "Tú") es de gran importancia. Esta Política aplica a la información personal que recogemos a través del sitio web.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Datos que recopilamos</h3>
                    <p>
                        Para el correcto funcionamiento del portal, requerimos que nos facilites algunos datos mínimos en el momento de crear tu cuenta:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Datos de Identificación:</strong> Correo electrónico y nombre público.</li>
                        <li><strong>Datos de Contacto:</strong> Número de teléfono (opcional) usado para tus anuncios.</li>
                        <li><strong>Datos de Sesión:</strong> Usamos Supabase Authentication para gestionar accesos seguros y manejar tus tokens de sesión.</li>
                    </ul>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Tratamiento de las Imágenes y Anuncios</h3>
                    <p>
                        Las imágenes que subas de tus maquinaria, animales, o fincas, al igual que las descripciones y precios, se considerarán de dominio público en lo que respecta al alcance de la plataforma, y podrán ser indexadas por buscadores (ej. Google) para ayudarte a llegar a más posibles compradores.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-[var(--ag-sys-color-text)]">Tus Derechos (RGPD)</h3>
                    <p>
                        De acuerdo al Reglamento General de Protección de Datos europeo y normativas de España, tienes derecho en todo momento a acceder, rectificar o cancelar la totalidad de tu información. Puedes eliminar temporalmente tus anuncios o solicitar la eliminación total y definitiva ("Derecho al Olvido") de tu base de datos contactando a nuestro soporte o gestionándolo desde las opciones de tu perfil.
                    </p>

                    <p className="text-sm mt-8 p-4 bg-[var(--ag-sys-color-background)] rounded-xl border border-[var(--ag-sys-color-border)]">
                        <em>Nota: Los mensajes del Chat de Ruralpop están encriptados y solo pueden ser visibles de forma explícita por los remitentes y receptores de los mismos dentro de sus paneles privados.</em>
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de política de privacidad creada para arreglar el link roto del 404 del footer.
 * - Basada en políticas standard sobre RGPD y la naturaleza pública de tablones de anuncios.
 */
