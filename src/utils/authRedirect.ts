/**
 * Utility to generate localized login redirect URLs.
 * 
 * Ensures that whenever an unauthenticated user attempts to access a protected
 * page from Portugal (/pt) or Spain, they are directed to the correct language-specific
 * login route and returned to their intended destination upon successful authentication.
 */

export function getLoginRedirectUrl(locale: string = "es", currentPath?: string): string {
    const isPt = locale === "pt";
    const loginBase = isPt ? "/pt/login" : "/login";

    if (!currentPath) {
        return loginBase;
    }

    let target = currentPath;
    // Ensure that if the user was on /pt, the return path is also prefixed with /pt
    if (isPt && !target.startsWith("/pt")) {
        target = `/pt${target === "/" ? "" : target}`;
    }

    return `${loginBase}?redirectTo=${encodeURIComponent(target)}`;
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Centralización de Redirecciones: Previene la duplicación de lógica 'if (isPt)'
 *      en múltiples Server Components (/upload, /account, /dashboard, etc.).
 *    - Preservación de Contexto i18n: Evita que los usuarios de Portugal sean
 *      expulsados a la ruta española '/login' perdiendo su idioma y su destino.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - currentPath vacío o raíz ('/').
 *    - currentPath con query parameters o caracteres que requieran encoding (encodeURIComponent).
 *    - Rutas que ya incluyan o no el prefijo '/pt'.
 * -----------------------------------------------------------------------------
 */
