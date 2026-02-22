"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

export function InstallBanner() {
    const { showAlert } = useNotification();
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Ejecutamos esto solo en el lado del cliente (navegador)
        if (typeof window === "undefined") return;

        // Comparamos display-mode: standalone o si navigator.standalone existe (para iOS antiguo)
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;

        // Detectar si el usuario está en iOS y en general en móvil
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        setIsIOS(isIOSDevice);

        // Si la app se está lanzando directamente, no mostramos el banner
        if (isStandalone || !isMobile) {
            return;
        }

        // Si el usuario ya desestimó anteriormente el banner
        const hasDismissed = localStorage.getItem("installBannerDismissed");
        if (hasDismissed) {
            return;
        }

        // Gestión en Android / Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            // Evitamos la barra por defecto de Chrome e interceptamos con la nuestra
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Para iOS no existe 'beforeinstallprompt', así que lo mostramos manualmente
        if (isIOSDevice) {
            setIsVisible(true);
        } else {
            // También podemos mostrarlo en Android pasado un segundo por si el evento no salta, pero ya tenemos soporte para add-to-homescreen nativo vía navegador
            // Descomentar esto si queremos forzar el aviso genérico en android si no existe el PWA manifest:
            setTimeout(() => {
                setIsVisible((prev) => prev || true);
            }, 1000);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            showAlert({
                title: "Instalar en iOS",
                message: "Toca el botón de 'Compartir' (el cuadrado con la flecha) en la parte inferior de Safari y elige 'Añadir a la pantalla de inicio'.",
                type: "info"
            });
            return;
        }

        if (deferredPrompt) {
            // Disparamos la instalación nativa del navegador
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setIsVisible(false);
            }
            // Anulamos el prompt ya que solo se puede solicitar una vez
            setDeferredPrompt(null);
        } else {
            // Fallback genérico para Android/Otros que no capturaron el evento
            showAlert({
                title: "Añadir a inicio",
                message: "Abre el menú de tu navegador (los tres puntos arriba a la derecha) y selecciona 'Instalar aplicación' o 'Añadir a la pantalla de inicio'.",
                type: "info"
            });
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("installBannerDismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="md:hidden bg-gradient-to-r from-[var(--ag-sys-color-primary)] to-[#0c804b] text-white px-4 py-3 flex items-center justify-between shadow-md relative z-50 animate-in slide-in-from-top-full duration-500">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-white/20 flex items-center justify-center rounded-xl flex-shrink-0 backdrop-blur-sm shadow-inner">
                    <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">Lleva Ruralpop contigo</p>
                    <p className="text-xs text-white/90 truncate font-medium">Instala la app gratis</p>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pl-3">
                <button
                    onClick={handleInstall}
                    className="bg-white text-[var(--ag-sys-color-primary)] text-xs font-bold px-3.5 py-2 rounded-xl active:scale-95 transition-transform shadow-sm"
                >
                    Instalar
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-white/70 hover:text-white rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                    aria-label="Cerrar aviso"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se muestra en móviles (`md:hidden`) siempre que no estemos ya en modo "standalone" (PWA iniciada desde escritorio)
 * - Persistencia del cierre en `localStorage` (installBannerDismissed) para no molestar tras cerrarlo.
 * - Soporte adaptado a iOS (donde no funciona el auto-prompt de instalación) emitiendo una notificación manual.
 * - Animación sutil de entrada desde arriba para captar la atención.
 */
