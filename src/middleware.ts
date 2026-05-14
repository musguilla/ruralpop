import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { getInternalSpanishRoute } from "@/i18n/utils";

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Redirigir URLs heredadas como /vaca/anuncio/[slug] o con dobles barras /vaca//anuncio/[slug]
    // hacia la nueva estructura limpia /anuncio/[slug]
    if (pathname.includes('/anuncio/')) {
        // Al dividir y filtrar Boolean, eliminamos posibles slashes dobles ""
        const segments = pathname.split('/').filter(Boolean);
        const anuncioIndex = segments.indexOf('anuncio');

        // Si "anuncio" existe y NO es el primer segmento (index > 0)
        // Significa que tenemos algo como "categoria/anuncio/slug"
        if (anuncioIndex > 0) {
            // Reconstruimos la URL cogiendo desde "anuncio" en adelante
            const newPathname = '/' + segments.slice(anuncioIndex).join('/');
            const url = new URL(`${newPathname}${search}`, request.url);
            // 301 Permanent Redirect
            return NextResponse.redirect(url, 301);
        }
    }

    // i18n Rewrite Logic (Option B)
    const isPt = pathname === '/pt' || pathname.startsWith('/pt/');
    const locale = isPt ? 'pt' : 'es';
    
    let response = NextResponse.next();
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', locale);
    requestHeaders.set('x-original-pathname', pathname);

    if (isPt) {
        const { routeKey, internalPath } = getInternalSpanishRoute(pathname);
        if (routeKey) requestHeaders.set('x-route-key', routeKey);
        
        // Rewrite internally to the Spanish page
        const url = new URL(`${internalPath}${search}`, request.url);
        response = NextResponse.rewrite(url, {
            request: { headers: requestHeaders }
        });
    } else {
        const { routeKey } = getInternalSpanishRoute(pathname);
        if (routeKey) requestHeaders.set('x-route-key', routeKey);
        
        response = NextResponse.next({
            request: { headers: requestHeaders }
        });
    }

    // Update user's auth session, preserving our rewrite and headers
    return await updateSession(request, response);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

/**
 * Memory / Decisiones Técnicas:
 * - El Middleware intercepta todas las peticiones (excluyendo estáticos)
 *   para garantizar que la cookie de Supabase Auth está fresca antes del render SSR de las páginas de Next.
 */
