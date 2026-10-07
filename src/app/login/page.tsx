import Image from "next/image";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { login } from "./actions";
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
    const originalPathname = headersList.get('x-original-pathname') || '/login';

    return {
        title: isPt ? `Iniciar Sessão | ${brand}` : `Inicia Sesión | ${brand}`,
        description: isPt 
            ? `Inicie sessão na sua conta da ${brand} para publicar e gerir os seus anúncios.` 
            : `Inicia sesión en tu cuenta de ${brand} para publicar y gestionar tus anuncios.`,
        alternates: {
            canonical: getCanonicalUrl(originalPathname, locale, currentDomain),
            languages: getHreflangLinks(originalPathname, currentDomain)
        }
    };
}

export default async function LoginPage(props: {
    searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>;
}) {
    const searchParams = await props.searchParams;
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';

    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';

    const registerHref = searchParams?.redirectTo 
        ? `/register?redirectTo=${encodeURIComponent(searchParams.redirectTo)}`
        : "/register";

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    <div className="mb-4">
                        <Image src={isEquipop ? "/equipop-logo.png" : "/ruralpop-logo.png"} alt={isEquipop ? "Equipop" : "Ruralpop"} width={160} height={40} className="object-contain" priority />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        {isPt ? "Iniciar Sessão" : "Inicia Sesión"}
                    </h2>
                </div>

                {searchParams?.message && (
                    <div className={`p-4 text-sm rounded-md border text-center ${isEquipop ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                        {searchParams.message}
                    </div>
                )}

                {searchParams?.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800 text-center">
                        {searchParams.error}
                    </div>
                )}

                <form className="mt-8 space-y-6" action={login}>
                    <input type="hidden" name="locale" value={locale} />
                    {searchParams?.redirectTo && (
                        <input type="hidden" name="redirectTo" value={searchParams.redirectTo} />
                    )}
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
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                {isPt ? "Palavra-passe" : "Contraseña"}
                            </label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <SubmitButton label={isPt ? "Entrar" : "Entrar"} />

                    <div className="text-center mt-4">
                        <LocalizedLink
                            href="/forgot-password"
                            className="text-sm font-medium text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] hover:underline transition-all"
                        >
                            {isPt ? "Esqueceu-se da palavra-passe?" : "¿Olvidaste tu contraseña?"}
                        </LocalizedLink>
                    </div>

                    <div className="pt-6 text-center border-t border-[var(--ag-sys-color-border)] mt-8">
                        <p className="text-sm text-[var(--ag-sys-color-text-muted)] mb-4">
                            {isPt ? "Ainda não tem conta?" : "¿Aún no tienes cuenta?"}
                        </p>
                        <LocalizedLink
                            href={registerHref}
                            className="group relative w-full flex justify-center py-3 px-4 border border-[var(--ag-sys-color-primary)] text-sm font-medium rounded-xl text-[var(--ag-sys-color-primary)] hover:bg-[var(--ag-sys-color-primary)] hover:text-white transition-all shadow-sm"
                        >
                            {isPt ? "Registe-se grátis" : "Regístrate gratis"}
                        </LocalizedLink>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Enlaces Localizados en Login: Se reemplaza 'Link' por 'LocalizedLink' para que
 *      los accesos a /register y /forgot-password mantengan automáticamente el prefijo
 *      '/pt' cuando la navegación ocurre en el portal portugués.
 *    - Propagación de Locale en Formulario: Se incluye un campo hidden 'locale' para que
 *      el Server Action 'login' conozca el idioma del cliente incluso en contextos donde
 *      ciertos navegadores no reenviaran cabeceras específicas en POST nativos.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Preservación de 'redirectTo': El enlace hacia el registro propaga el 'redirectTo'
 *      existente para que tras crear cuenta y validar se retome el flujo original (ej: /pt/upload).
 *    - Traducción inmediata de etiquetas sin parpadeo (SSR).
 * -----------------------------------------------------------------------------
 */
