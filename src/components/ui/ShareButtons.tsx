"use client";
import { useTranslation } from "@/context/LocaleContext";

import React from "react";
import { Link as LinkIcon, Share2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

interface ShareButtonsProps {
    title: string;
    url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const { t } = useTranslation();
    const { showAlert } = useNotification();
    const [canNativeShare, setCanNativeShare] = React.useState(false);

    React.useEffect(() => {
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            setCanNativeShare(true);
        }
    }, []);

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    url
                });
            } catch {
                // El usuario canceló la hoja nativa de compartir
            }
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url).then(() => {
            showAlert({
                title: t("link_copied_title") || "Enlace copiado",
                message: t("link_copied_msg") || "El enlace al anuncio se ha copiado al portapapeles.",
                type: "success"
            });
        }).catch(() => {
            showAlert({
                title: "Error",
                message: "No se ha podido copiar el enlace.",
                type: "error"
            });
        });
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

    return (
        <div className="mt-8 mb-6">
            <h4 className="text-lg font-bold text-[var(--ag-sys-color-text)] mb-4 px-1">{t("comparte_anuncio")}</h4>
            <div className="flex items-center gap-4 px-1">
                {/* Compartir Nativo (Dispositivos móviles / Navegadores compatibles) */}
                {canNativeShare && (
                    <button
                        onClick={handleNativeShare}
                        className="w-12 h-12 flex items-center justify-center bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-border)] transition-colors rounded-full"
                        aria-label="Compartir en el dispositivo"
                        title="Compartir"
                    >
                        <Share2 className="w-5 h-5 text-[var(--ag-sys-color-text)]" strokeWidth={2.2} />
                    </button>
                )}

                {/* WhatsApp */}
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-border)] transition-colors rounded-full"
                    aria-label="Compartir en WhatsApp"
                    title="WhatsApp"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ag-sys-color-text)]">
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                </a>

                {/* Facebook */}
                <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-border)] transition-colors rounded-full"
                    aria-label="Compartir en Facebook"
                    title="Facebook"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ag-sys-color-text)]">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                </a>

                {/* X (Twitter) */}
                <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-border)] transition-colors rounded-full"
                    aria-label="Compartir en X (Twitter)"
                    title="X (Twitter)"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-[var(--ag-sys-color-text)]">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                </a>

                {/* Copiar Enlace */}
                <button
                    onClick={handleCopyLink}
                    className="w-12 h-12 flex items-center justify-center bg-[var(--ag-sys-color-background)] hover:bg-[var(--ag-sys-color-border)] transition-colors rounded-full"
                    aria-label="Copiar enlace"
                    title="Copiar enlace"
                >
                    <LinkIcon className="w-5 h-5 text-[var(--ag-sys-color-text)]" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// Documentación de Memoria y Decisiones Técnicas (RULE[user_global])
// ============================================================================
/**
 * Decisiones Técnicas:
 * 1. Web Share API (`navigator.share`):
 *    - Se detecta de forma progresiva en el cliente mediante un efecto inicial.
 *    - Si el navegador soporta `navigator.share` (como Safari en iOS o Chrome en Android), se presenta
 *      el botón nativo de compartir para invocar la hoja del sistema con el título y la URL dinámica
 *      del tenant (Equipop o Ruralpop).
 * 2. Multi-Tenant URL Handling:
 *    - La prop `url` se inyecta desde los Server Components utilizando `getServerTenantDomain()`, garantizando
 *      que en la web de Equipop se compartan enlaces directos a `https://www.equipop.app` o `https://equipop.app`.
 * 3. Diseño & Antigravity Sync:
 *    - Tokens semánticos `var(--ag-sys-color-...)` en lugar de colores arbitrarios.
 *    - Cero `any` en todo el flujo de tipado.
 */
