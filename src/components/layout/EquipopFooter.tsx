import React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { headers } from "next/headers";
import { LocaleCode } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function EquipopFooter() {
    const currentYear = new Date().getFullYear();
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const dict = await getDictionary(locale);

    const t = (key: keyof typeof dict.footer): string => {
        return dict.footer[key] || key;
    };

    return (
        <footer className="w-full border-t border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-surface)] py-12 mt-auto">
            {/* Top Section: 3 Columns with Dividers */}
            <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-4 mb-12">
                
                {/* Column 1: Conexión Equipop */}
                <div className="flex flex-col items-start gap-3 lg:w-1/3">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        Conexión Equipop
                    </span>
                    <LocalizedLink href="/tienda" className="text-base font-medium text-[var(--ag-sys-color-primary)] hover:opacity-80 transition-opacity">
                        Tienda Equipop
                    </LocalizedLink>
                </div>

                {/* Vertical Divider 1 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 2: Información */}
                <div className="flex flex-col items-start gap-3 lg:w-1/3 lg:pl-10">
                    <span className="text-[13px] text-[var(--ag-sys-color-text)] font-semibold uppercase tracking-wider mb-1">
                        {t("informacion")}
                    </span>
                    <LocalizedLink href="/como-comprar" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        ¿Cómo comprar?
                    </LocalizedLink>
                    <LocalizedLink href="/como-vender" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        ¿Cómo vender?
                    </LocalizedLink>
                    <LocalizedLink href="/pago-seguro" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Cómo funciona Pago Seguro
                    </LocalizedLink>
                    <LocalizedLink href="/quienes-somos" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Quienes somos
                    </LocalizedLink>
                    <LocalizedLink href="/preguntas-frecuentes" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        {t("faq")}
                    </LocalizedLink>
                    <LocalizedLink href="/empresas-profesionales-sector-ecuestre" className="text-base font-medium text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors">
                        Equipop PRO
                    </LocalizedLink>
                </div>

                {/* Vertical Divider 2 */}
                <div className="hidden lg:block w-px h-auto self-stretch bg-[var(--ag-sys-color-border)] shrink-0"></div>

                {/* Column 3: App Store / Google Play */}
                <div className="flex flex-row lg:flex-col items-center justify-center gap-4 lg:w-1/3 lg:items-center mt-6 lg:mt-0">
                    {/* Apple App Store Native SVG Badge */}
                    <a href="https://apps.apple.com/es/app/ruralpop/id6759678666" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-all cursor-pointer" title={t("descargar_apple")}>
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/app-store-logo.svg" alt={t("descargar_apple")} className="h-[55px] w-auto" />
                    </a>

                    {/* Google Play Native SVG Badge (Disabled) */}
                    <div className="opacity-50 grayscale cursor-not-allowed pointer-events-none" title={t("descargar_google")}>
                        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/wpublic/google-play-logo.svg" alt={t("descargar_google")} className="h-[55px] w-auto" />
                    </div>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="container mx-auto px-4 pt-8 border-t border-[var(--ag-sys-color-border)] flex flex-col lg:flex-row justify-between items-start gap-8">
                
                {/* Left: Logo & Description */}
                <div className="flex flex-col max-w-sm gap-4">
                    <div className="flex items-center gap-6">
                        <LocalizedLink href="/" className="hover:opacity-80 transition-opacity">
                            <Image src="/equipop-logo.png" alt="Equipop" width={140} height={40} className="object-contain dark:invert" />
                        </LocalizedLink>
                        <a href="https://www.instagram.com/equipopapp" target="_blank" rel="noopener noreferrer" className="text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors" aria-label="Instagram">
                            <Instagram className="w-7 h-7" strokeWidth={2.25} />
                        </a>
                    </div>
                    <p className="text-[var(--ag-sys-color-text-muted)] text-sm leading-relaxed">
                        App gratis para buscar, comprar y vender material y equipamientos hípicos.
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
                        &copy; {currentYear} Equipop. {t("derechos")}
                    </div>
                </div>

            </div>
        </footer>
    );
}
