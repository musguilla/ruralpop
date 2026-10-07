import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "./actions";
import { getServerTenantSlug, getServerTenantDomain } from "@/utils/tenant/server";
import { headers } from "next/headers";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { LocaleCode } from "@/i18n/config";
import { getHreflangLinks, getCanonicalUrl } from "@/i18n/utils";

export async function generateMetadata() {
    const tenant = await getServerTenantSlug();
    const currentDomain = await getServerTenantDomain();
    const isEquipop = tenant === 'equipop' || currentDomain.includes('equipop');
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';
    const originalPathname = headersList.get('x-original-pathname') || '/forgot-password';

    return {
        title: isPt ? `Recuperar Palavra-passe | ${brand}` : `Recuperar Contraseña | ${brand}`,
        description: isPt 
            ? `Recupere o acesso à sua conta da ${brand}.` 
            : `Recupera el acceso a tu cuenta de ${brand}.`,
        alternates: {
            canonical: getCanonicalUrl(originalPathname, locale, currentDomain),
            languages: getHreflangLinks(originalPathname, currentDomain)
        }
    };
}

export default async function ForgotPasswordPage(props: {
    searchParams: Promise<{ error?: string, message?: string }>;
}) {
    const searchParams = await props.searchParams;
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    <div className="mb-4">
                        <LocalizedLink href="/">
                            <Image src={isEquipop ? "/equipop-logo.png" : "/ruralpop-logo.png"} alt={isEquipop ? "Equipop" : "Ruralpop"} width={160} height={40} className="object-contain" priority />
                        </LocalizedLink>
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        {isPt ? "Recuperar Palavra-passe" : "Recuperar Contraseña"}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                        {isPt 
                            ? "Insira o seu email e enviaremos as instruções para redefinir a sua palavra-passe." 
                            : "Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña."}
                    </p>
                </div>

                {searchParams?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-md border border-red-200 dark:border-red-800 text-center">
                        {searchParams.error}
                    </div>
                )}

                {searchParams?.message && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm p-3 rounded-md border border-green-200 dark:border-green-800 text-center">
                        {searchParams.message}
                    </div>
                )}

                {!searchParams?.message && (
                    <form className="mt-8 space-y-6" action={forgotPassword}>
                        <input type="hidden" name="locale" value={locale} />
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                    {isPt ? "Email" : "Correo electrónico"}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                                    placeholder={isPt ? "o-seu@email.com" : "tu@email.com"}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ag-sys-color-primary)] transition-all shadow-sm"
                        >
                            {isPt ? "Enviar instruções" : "Enviar instrucciones"}
                        </button>
                    </form>
                )}

                <div className="pt-6 text-center border-t border-[var(--ag-sys-color-border)] mt-8">
                    <LocalizedLink
                        href="/login"
                        className="text-sm font-medium text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-primary)] transition-all"
                    >
                        {isPt ? "Voltar ao Início de Sessão" : "Volver a Iniciar sesión"}
                    </LocalizedLink>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Vista minimalista y enfocada en solicitar el email.
 * - Soporte multilingüe completo (ES / PT) tanto en renderizado como en metadatos y canonicals.
 * - Soporta parámetro de mensaje ?message para confirmar el envío sin redirigir abruptamente.
 */
