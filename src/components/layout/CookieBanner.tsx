"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Al montar verificamos si ya existe la cookie/localStorage
        const consent = localStorage.getItem("ruralpop_cookie_consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("ruralpop_cookie_consent", "accepted");
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem("ruralpop_cookie_consent", "rejected");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-full max-w-sm sm:max-w-md bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-2xl shadow-xl p-6 sm:p-8 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-3">
                Privacidad
            </h3>
            <p className="text-sm text-[var(--ag-sys-color-text-muted)] leading-relaxed mb-4">
                En Ruralpop, tanto nosotros como nuestros socios almacenamos o accedemos a información del dispositivo, como identificadores únicos en las cookies para tratar datos personales. Puedes aceptar o administrar tus preferencias haciendo clic abajo, incluido el derecho de oposición en función de tu interés legítimo o, en cualquier momento, a través de la página de la política de privacidad. Tus preferencias se notificarán a nuestros socios y no afectarán a los datos de navegación.
            </p>

            <h4 className="text-sm font-bold text-[var(--ag-sys-color-text)] mb-2">
                ¿Para qué tratamos los datos?
            </h4>
            <p className="text-sm text-[var(--ag-sys-color-text-muted)] leading-relaxed mb-6">
                Utilizar datos de localización geográfica precisa. Analizar activamente las características del dispositivo para su identificación. Almacenar la información en un dispositivo y/o acceder a ella. Publicidad y contenido personalizados, medición de publicidad y contenido, investigación de audiencia y desarrollo de servicios.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleReject}
                    className="flex-1 py-3 px-4 rounded-xl border border-[var(--ag-sys-color-border)] text-sm font-bold text-[var(--ag-sys-color-text)] hover:bg-[var(--ag-sys-color-surface-muted)] transition-colors focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] outline-none"
                >
                    Rechazar todo
                </button>
                <button
                    onClick={handleAccept}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)] outline-none"
                >
                    Aceptar todo
                </button>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se asume que no renderiza hasta que el cliente evalúa `useEffect` (Server-Side Rendering safe).
 * - Uso de `localStorage` de manera básica y estricta para resolver el ciclo de vida.
 * - Posicionado `fixed` en la esquina inferior derecha con mucho z-index para solapar cualquier listado pero no interrumpir el flujo.
 */
