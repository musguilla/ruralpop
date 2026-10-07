import Image from "next/image";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { signup } from "./actions";
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
    const originalPathname = headersList.get('x-original-pathname') || '/register';

    return {
        title: isPt ? `Criar Conta | ${brand}` : `Crea una Cuenta | ${brand}`,
        description: isPt 
            ? `Junte-se ao ${brand} e comece a comprar e vender no mercado agrícola e pecuário.` 
            : `Únete a ${brand} y empieza a comprar y vender en el mercado agrícola y ganadero.`,
        alternates: {
            canonical: getCanonicalUrl(originalPathname, locale, currentDomain),
            languages: getHreflangLinks(originalPathname, currentDomain)
        }
    };
}

export default async function RegisterPage(props: {
    searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
    const searchParams = await props.searchParams;
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';

    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';

    const loginHref = searchParams?.redirectTo
        ? `/login?redirectTo=${encodeURIComponent(searchParams.redirectTo)}`
        : "/login";

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--ag-sys-color-surface)] p-8 rounded-2xl shadow-sm border border-[var(--ag-sys-color-border)]">

                <div className="text-center flex flex-col items-center">
                    <div className="mb-4">
                        <Image src={isEquipop ? "/equipop-logo.png" : "/ruralpop-logo.png"} alt={isEquipop ? "Equipop" : "Ruralpop"} width={160} height={40} className="object-contain" priority />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)]">
                        {isPt ? "Criar Conta" : "Crea una Cuenta"}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--ag-sys-color-text-muted)]">
                        {isPt ? "Já é membro? " : "¿Ya eres miembro? "}
                        <LocalizedLink
                            href={loginHref}
                            className="font-medium text-[var(--ag-sys-color-primary)] hover:text-[var(--ag-sys-color-primary-hover)] transition-colors"
                        >
                            {isPt ? "Inicie sessão aqui" : "Inicia sesión aquí"}
                        </LocalizedLink>
                    </p>
                </div>

                {searchParams?.error === "user_exists" ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-md border border-blue-200 dark:border-blue-800 text-center">
                        <strong>{isPt ? "Já tem uma conta na nossa rede!" : "¡Ya tienes una cuenta en nuestra red!"}</strong><br/>
                        {isPt 
                            ? "Este email já está registado. Pode usar a sua palavra-passe habitual para " 
                            : `Este correo electrónico ya está registrado en ${isEquipop ? "Ruralpop" : "Equipop"}. Puedes usar tu contraseña habitual para `}
                        <LocalizedLink href={loginHref} className="font-bold underline hover:text-[var(--ag-sys-color-primary)]">
                            {isPt ? "Iniciar sessão" : "Iniciar sesión"}
                        </LocalizedLink>
                        {isPt ? ". Se não se lembra, utilize " : ". Si no la recuerdas, utiliza "}
                        <LocalizedLink href="/forgot-password" className="font-bold underline hover:text-[var(--ag-sys-color-primary)]">
                            {isPt ? "Recuperar palavra-passe" : "Recordar contraseña"}
                        </LocalizedLink>
                        .
                    </div>
                ) : searchParams?.error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-800 text-center">
                        {searchParams.error}
                    </div>
                ) : null}

                <form className="mt-8 space-y-6" action={signup}>
                    <input type="hidden" name="locale" value={locale} />
                    {searchParams?.redirectTo && (
                        <input type="hidden" name="redirectTo" value={searchParams.redirectTo} />
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                {isPt ? "Nome completo" : "Nombre completo"}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-[var(--ag-sys-color-border)] bg-[var(--ag-sys-color-background)] text-[var(--ag-sys-color-text)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ag-sys-color-primary)] focus:border-transparent transition-all sm:text-sm"
                                placeholder={isPt ? "João Silva" : "Juan Prieto"}
                            />
                        </div>
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
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirm" className="block text-sm font-medium text-[var(--ag-sys-color-text)] mb-1">
                                {isPt ? "Repita a palavra-passe" : "Repite la contraseña"}
                            </label>
                            <PasswordInput
                                id="password_confirm"
                                name="password_confirm"
                                autoComplete="new-password"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <SubmitButton label={isPt ? "Registar-me grátis" : "Registrarme gratis"} />
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
 *    - Internacionalización en Registro: Toda la interfaz se adapta al portugués
 *      cuando se accede desde '/pt/register', utilizando placeholders naturales de Portugal.
 *    - LocalizedLink para Rutas Auth: Garantiza que el paso de /register a /login o /forgot-password
 *      no destruya el prefijo '/pt'.
 *    - Persistencia de Redirección: Si el usuario inició el flujo en /pt/upload, se propaga el 'redirectTo'
 *      a través del form hidden input.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Usuario existente con cuenta unificada: Se muestra mensaje informativo localizado
 *      con enlace directo a login preservando locale.
 * -----------------------------------------------------------------------------
 */
