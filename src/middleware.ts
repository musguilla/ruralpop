import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { getInternalSpanishRoute } from "@/i18n/utils";

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // --- Anti-Scraping Basico ---
    const userAgent = request.headers.get('user-agent') || '';
    const blockedAgents = [
        'python-requests', 'curl', 'scrapy', 'bot', 'crawler', 'spider', 'wget', 'postman', 'insomnia', 'httpclient', 'urllib'
    ];
    // Permitir Googlebot, Bingbot, etc. para SEO
    const allowedBots = ['googlebot', 'bingbot', 'yandexbot', 'slurp', 'duckduckbot', 'baiduspider', 'twitterbot', 'facebookexternalhit'];
    
    const uaLower = userAgent.toLowerCase();
    const isBlocked = blockedAgents.some(agent => uaLower.includes(agent));
    const isAllowed = allowedBots.some(agent => uaLower.includes(agent));

    if (isBlocked && !isAllowed) {
        return new NextResponse("Access Denied", { status: 403 });
    }

    // --- Multi-Tenant: Equipop Domain Detection ---
    const hostname = request.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const isEquipop = hostname.includes('equipop');
    const isRuralpopPt = hostname.includes('ruralpop.pt') || hostname.includes('pt.localhost');

    // Reconocemos equipop.app, www.equipop.app, o entornos locales como equipop.localhost:3000
    if (isEquipop) {
        // Evitamos bucles y también ignoramos rutas de API estáticas
        if (!pathname.startsWith('/equipop') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-tenant', 'equipop');
            
            // Para el panel de administración, no reescribimos la ruta, solo pasamos el tenant
            if (pathname.startsWith('/admin')) {
                let response = NextResponse.next({
                    request: { headers: requestHeaders }
                });
                return await updateSession(request, response);
            } else {
                const url = request.nextUrl.clone();
                url.pathname = `/equipop${pathname === '/' ? '' : pathname}`;
                
                let response = NextResponse.rewrite(url, {
                    request: { headers: requestHeaders }
                });
                return await updateSession(request, response);
            }
        }
    } else {
        // Si un usuario accede a rutas internas /equipop/* desde ruralpop.com u otros dominios,
        // retenemos al usuario dentro de Ruralpop en lugar de expulsarlo a Equipop:
        // - Si es /equipop/contact se redirige 301 al formulario de contacto de Ruralpop (/contact).
        // - Para cualquier otra ruta /equipop se redirige 301 a la portada de Ruralpop (/).
        if ((pathname === '/equipop' || pathname.startsWith('/equipop/')) && !isLocalhost) {
            const isContact = pathname.startsWith('/equipop/contact');
            const targetPath = isContact ? '/contact' : '/';
            const targetUrl = new URL(`${targetPath}${search}`, request.url);
            return NextResponse.redirect(targetUrl, 301);
        }
    }

    // --- Redirección unificada para el panel de administración ---
    // Toda la administración de Ruralpop (España y Portugal) se gestiona exclusivamente en ruralpop.com/admin
    if (isRuralpopPt && pathname.startsWith('/admin') && !isLocalhost) {
        const targetUrl = new URL(`${pathname}${search}`, 'https://www.ruralpop.com');
        return NextResponse.redirect(targetUrl, 301);
    }

    // --- Redirección canónica de rutas /pt hacia ruralpop.pt ---
    // Si acceden a ruralpop.com/pt/* en producción, migramos la visita con 301 a ruralpop.pt/*
    if (!isRuralpopPt && (pathname === '/pt' || pathname.startsWith('/pt/')) && !isLocalhost) {
        const cleanPtPath = pathname.replace(/^\/pt/, '') || '/';
        const targetUrl = new URL(`${cleanPtPath}${search}`, 'https://www.ruralpop.pt');
        return NextResponse.redirect(targetUrl, 301);
    }

    // Si acceden a ruralpop.pt con el prefijo redundante /pt, limpiamos a la ruta nativa
    if (isRuralpopPt && (pathname === '/pt' || pathname.startsWith('/pt/'))) {
        const cleanPtPath = pathname.replace(/^\/pt/, '') || '/';
        const targetUrl = new URL(`${cleanPtPath}${search}`, request.url);
        return NextResponse.redirect(targetUrl, 301);
    }

    // Redirigir URLs heredadas como /vaca/anuncio/[slug] o con dobles barras /vaca//anuncio/[slug]
    // hacia la nueva estructura limpia /anuncio/[slug]
    if (pathname.includes('/anuncio/')) {
        // Al dividir y filtrar Boolean, eliminamos posibles slashes dobles ""
        const segments = pathname.split('/').filter(Boolean);
        const anuncioIndex = segments.indexOf('anuncio');

        // Si "anuncio" existe y NO es el primer segmento (index > 0)
        // Significa que tenemos algo como "categoria/anuncio/slug"
        const isLocaleOrTenant = (!isRuralpopPt && segments[0] === 'pt') || segments[0] === 'equipop';
        const expectedAnuncioIndex = isLocaleOrTenant ? 1 : 0;

        if (anuncioIndex > expectedAnuncioIndex) {
            const prefix = isLocaleOrTenant ? `/${segments[0]}` : '';
            const newPathname = prefix + '/' + segments.slice(anuncioIndex).join('/');
            const url = new URL(`${newPathname}${search}`, request.url);
            // 301 Permanent Redirect
            return NextResponse.redirect(url, 301);
        }
    }

    // --- i18n & Domain Routing Logic ---
    const isPt = isRuralpopPt || pathname === '/pt' || pathname.startsWith('/pt/');
    const locale = isPt ? 'pt' : 'es';
    
    let response = NextResponse.next();
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', locale);
    requestHeaders.set('x-original-pathname', pathname);
    requestHeaders.set('x-tenant', 'ruralpop');

    if (isPt) {
        const { routeKey, internalPath } = getInternalSpanishRoute(pathname, 'pt');
        if (routeKey) requestHeaders.set('x-route-key', routeKey);
        
        // Si la ruta en portugués difiere de la ruta interna en español, reescribimos internamente
        if (internalPath !== pathname) {
            const url = new URL(`${internalPath}${search}`, request.url);
            response = NextResponse.rewrite(url, {
                request: { headers: requestHeaders }
            });
        } else {
            response = NextResponse.next({
                request: { headers: requestHeaders }
            });
        }
    } else {
        const { routeKey } = getInternalSpanishRoute(pathname, 'es');
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
 * - Bloqueo Anti-Scraping: Se filtran peticiones de herramientas comunes de scrapping/scripts (Python, cURL, etc) 
 *   mientras se hace whitelist explícito a los bots de SEO para proteger la BD.
 * - Aislamiento Multi-Tenant & Retención de Usuarios: Si un usuario accede a rutas `/equipop/*`
 *   desde `ruralpop.com`, se redirige 301 a la URL homóloga de Ruralpop (ej. `/equipop/contact` -> `/contact`,
 *   o a la portada `/` para el resto). Esto evita fugas de tráfico o que usuarios ganaderos/agrícolas
 *   acaben desorientados en la plataforma hípica Equipop.
 */
