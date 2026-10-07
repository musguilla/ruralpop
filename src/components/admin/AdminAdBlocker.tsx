"use client";

import { useEffect } from "react";

/**
 * AdminAdBlocker
 * 
 * Componente de protección exclusivo para el panel de administración (/admin).
 * Bloquea y elimina cualquier intento de inserción de anuncios automáticos de Google AdSense
 * o viñetas intersticiales (vignette ads) generadas en navegación SPA desde páginas públicas.
 * 
 * Garantía de aislamiento: Solo se ejecuta dentro de AdminLayout. No tiene ningún efecto
 * fuera de las rutas /admin.
 */
export function AdminAdBlocker() {
    useEffect(() => {
        // 1. Limpiar el hash #google_vignette de la URL si se intentó abrir una viñeta
        if (typeof window !== "undefined" && window.location.hash.includes("google_vignette")) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }

        // 2. Función de eliminación de contenedores publicitarios residuales
        const purgeAdArtifacts = () => {
            const selectors = [
                'iframe[id^="aswift_"]',
                'div[id^="aswift_"]',
                'iframe[id^="google_ads_frame"]',
                '#google_esf',
                '.google-auto-placed',
                'ins.adsbygoogle',
                '[data-google-query-id]',
                'div[aria-label="Advertisement"]',
                'div[aria-label="Anuncio"]'
            ];

            selectors.forEach((sel) => {
                document.querySelectorAll(sel).forEach((el) => {
                    el.remove();
                });
            });

            // Si AdSense congeló el scroll del documento para mostrar el modal de viñeta
            if (document.body && document.body.style.overflow === "hidden") {
                document.body.style.overflow = "";
            }
            if (document.documentElement && document.documentElement.style.overflow === "hidden") {
                document.documentElement.style.overflow = "";
            }
        };

        purgeAdArtifacts();

        // 3. Observer pasivo para interceptar inserciones tardías sin impacto en rendimiento
        const observer = new MutationObserver(() => {
            purgeAdArtifacts();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
}

/**
 * Memory / Decisiones Técnicas:
 * - Google AdSense Auto Ads puede intentar desplegar anuncios viñeta (#google_vignette)
 *   al navegar hacia el panel de administración si el script fue precargado en una vista pública previa.
 * - Este componente purga activamente tales artefactos y desbloquea el scroll del body,
 *   garantizando un panel de administración 100% limpio y profesional.
 * - Su alcance está estrictamente acotado a AdminLayout.
 */
