import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

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
            return Response.redirect(url, 301);
        }
    }

    // Update user's auth session
    return await updateSession(request);
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
