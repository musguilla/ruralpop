import React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function Footer() {
    const currentYear = new Date().getFullYear();
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const dict = await getDictionary(locale);

    const t = (key: keyof typeof dict.footer): string => {
        return dict.footer[key] || key;
    };

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-12 mt-auto">
            {/* Top Section: 4 Columns with Dividers */}
            <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-4 mb-12">
                
                {/* Column 1: Conexión Rural */}
                <div className="flex flex-col items-start gap-3 lg:w-1/4">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        {t("conexion_rural")}
                    </span>
                    <LocalizedLink href="/tractores" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("catalogos_tractores")}
                    </LocalizedLink>
                    <LocalizedLink href="/magazine" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("magazine")}
                    </LocalizedLink>

                </div>

                {/* Vertical Divider 1 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 2: Lonjas y Mercados España */}
                <div className="flex flex-col items-start gap-3 lg:w-1/3 lg:pl-10">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        {t("lonjas_mercados")}
                    </span>
                    <LocalizedLink href="/precios-ganado/vacuno" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("precios_lonjas")}
                    </LocalizedLink>
                    <LocalizedLink href="/precios-ganado/vacuno/mercados/lonja-de-salamanca" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("lonja_salamanca")}
                    </LocalizedLink>
                    <LocalizedLink href="/precios-ganado/vacuno/mercados/mercado-nacional-de-ganado-de-pola-de-siero" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("mercado_siero")}
                    </LocalizedLink>
                    <LocalizedLink href="/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-talavera-de-la-reina" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("lonja_talavera")}
                    </LocalizedLink>
                    <LocalizedLink href="/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-leon" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("lonja_leon")}
                    </LocalizedLink>
                </div>

                {/* Vertical Divider 2 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 3: Información */}
                <div className="flex flex-col items-start gap-3 lg:w-1/5 lg:pl-10">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        {t("informacion")}
                    </span>
                    <LocalizedLink href="/preguntas-frecuentes" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("faq")}
                    </LocalizedLink>
                    <LocalizedLink href="/empresas-profesionales-sector-rural" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("eres_profesional")}
                    </LocalizedLink>
                </div>

                {/* Vertical Divider 3 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 4: App Store / Google Play */}
                <div className="flex flex-row lg:flex-col items-center justify-center gap-4 lg:w-1/5 lg:items-center mt-6 lg:mt-0">
                    {/* Google Play Native SVG Badge */}
                    <a href="https://play.google.com/store/apps/details?id=com.ruralpop.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer" title={t("descargar_google")}>
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/google-play-logo.svg" alt={t("descargar_google")} className="h-[55px] w-auto" />
                    </a>

                    {/* Apple App Store Native SVG Badge */}
                    <a href="https://apps.apple.com/es/app/ruralpop/id6759678666" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer" title={t("descargar_apple")}>
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/app-store-logo.svg" alt={t("descargar_apple")} className="h-[55px] w-auto" />
                    </a>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="container mx-auto px-4 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col lg:flex-row justify-between items-start gap-8">
                
                {/* Left: Logo & Description */}
                <div className="flex flex-col max-w-sm gap-4">
                    <div className="flex items-center gap-6">
                        <LocalizedLink href="/" className="hover:opacity-80 transition-opacity">
                            <Image src="/ruralpop-logo.png" alt="Ruralpop" width={140} height={40} className="object-contain dark:invert" />
                        </LocalizedLink>
                        <a href="https://www.instagram.com/ruralpopapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors" aria-label="Instagram">
                            <Instagram className="w-7 h-7" strokeWidth={2.25} />
                        </a>
                    </div>
                    <p className="text-[var(--ag-sys-color-text-muted)] text-sm leading-relaxed">
                        {t("descripcion")}
                    </p>
                </div>

                {/* Right: Legal & Copyright */}
                <div className="flex flex-col lg:items-end gap-6">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--ag-sys-color-text)]">
                        <LocalizedLink href="/aviso-legal" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            {t("aviso_legal")}
                        </LocalizedLink>
                        <LocalizedLink href="/privacy" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            {t("privacidad")}
                        </LocalizedLink>
                        <LocalizedLink href="/cookies" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            {t("cookies")}
                        </LocalizedLink>
                        <LocalizedLink href="/terms" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            {t("condiciones")}
                        </LocalizedLink>
                        <LocalizedLink href="/contact" className="hover:text-[var(--ag-sys-color-primary)] transition-colors" rel="nofollow">
                            {t("contacto")}
                        </LocalizedLink>
                    </div>
                    <div className="text-sm text-[var(--ag-sys-color-text-muted)]">
                        &copy; {currentYear} Ruralpop. {t("derechos")}
                    </div>
                </div>

            </div>
        </footer>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Footer reestructurado en 4 columnas principales (top) y una sección inferior para logo, info y legales.
 * - 'mt-auto' asegurará que el footer sea empujado hacia abajo si el main container flex es un min-h-screen.
 * - Se han incluido todas las lonjas utilizando sus slugs para mantener SEO robusto.
 */
