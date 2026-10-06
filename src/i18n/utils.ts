import { locales, LocaleCode, routeTranslations } from './config';

/**
 * Normalizes a path to ensure it starts with a slash and drops trailing slashes
 */
function normalizePath(p: string) {
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * Identifies the locale from the requested pathname
 */
export function getLocaleFromPath(pathname: string): LocaleCode {
  const normalized = normalizePath(pathname);
  if (normalized === '/pt' || normalized.startsWith('/pt/')) {
    return 'pt';
  }
  return 'es'; // default
}

/**
 * Maps a Portuguese URL slug back to its Spanish equivalent for internal rewriting
 */
export function getInternalSpanishRoute(pathname: string, forcedLocale?: LocaleCode): { routeKey: string | null, internalPath: string } {
  const locale = forcedLocale || getLocaleFromPath(pathname);
  
  if (locale === 'es') {
    const normalized = normalizePath(pathname);
    let foundKey = null;
    for (const [key, tr] of Object.entries(routeTranslations)) {
      if (tr.es === normalized) {
        foundKey = key;
        break;
      }
    }
    return { routeKey: foundKey, internalPath: pathname };
  }

  let ptSlug = pathname.replace(/^\/pt(\/|$)/, '/');
  if (ptSlug === '') ptSlug = '/';
  
  // Try exact match first
  for (const [key, tr] of Object.entries(routeTranslations)) {
    if (tr.pt === ptSlug) {
      return { routeKey: key, internalPath: tr.es };
    }
  }

  // Segment by segment translation for composite slugs (e.g. /pecuaria/suinos -> /ganaderia/porcino)
  if (ptSlug !== '/') {
    const segments = ptSlug.split('/').filter(Boolean);
    const translatedSegments = segments.map(segment => {
      const segmentWithSlash = `/${segment}`;
      for (const [key, tr] of Object.entries(routeTranslations)) {
        if (tr.pt === segmentWithSlash) {
          // Remove the slash from the translated part
          return tr.es.substring(1);
        }
      }
      return segment;
    });
    
    // Also try to find if this composite route has a base routeKey (just for tracking)
    return { routeKey: null, internalPath: '/' + translatedSegments.join('/') };
  }

  return { routeKey: null, internalPath: ptSlug };
}

/**
 * Gets a translated route given a key and locale
 */
export function getRouteByKey(routeKey: string, targetLocale: LocaleCode, isDomainPt: boolean = false): string {
  const tr = routeTranslations[routeKey];
  if (!tr) return '/';
  
  const path = tr[targetLocale];
  const prefix = isDomainPt ? '' : locales[targetLocale].prefix;
  
  if (path === '/') return prefix || '/';
  return `${prefix}${path}`;
}

/**
 * Given a pathname (in any locale), generates the full canonical URL for a specific locale
 */
export function getCanonicalUrl(pathname: string, targetLocale: LocaleCode, domain: string = 'https://www.ruralpop.com'): string {
  const isDomainPt = domain.includes('ruralpop.pt');
  const { routeKey, internalPath } = getInternalSpanishRoute(pathname, targetLocale);
  
  let targetPath = '';
  
  if (routeKey) {
    // It's a known translated route
    targetPath = getRouteByKey(routeKey, targetLocale, isDomainPt);
  } else {
    // Dynamic or untranslated route. Just prepend prefix if not on .pt native domain
    const prefix = isDomainPt ? '' : locales[targetLocale].prefix;
    targetPath = internalPath === '/' ? (prefix || '/') : `${prefix}${internalPath}`;
  }
  
  return `${domain}${targetPath}`;
}

/**
 * Returns hreflang alternates
 */
export function getHreflangLinks(pathname: string, domain: string = 'https://www.ruralpop.com') {
  const isEquipop = domain.includes('equipop');
  if (isEquipop) {
    const base = 'https://www.equipop.app';
    return {
      'es-ES': getCanonicalUrl(pathname, 'es', base),
      'pt-PT': getCanonicalUrl(pathname, 'pt', base),
      'x-default': getCanonicalUrl(pathname, 'es', base),
    };
  }

  const esBase = 'https://www.ruralpop.com';
  const ptBase = 'https://www.ruralpop.pt';

  // Rutas exclusivas del mercado español sin réplica en Portugal
  if (pathname.startsWith('/precios-ganado') || pathname.startsWith('/magazine')) {
    return {
      'es-ES': getCanonicalUrl(pathname, 'es', esBase),
      'x-default': getCanonicalUrl(pathname, 'es', esBase),
    };
  }

  return {
    'es-ES': getCanonicalUrl(pathname, 'es', esBase),
    'pt-PT': getCanonicalUrl(pathname, 'pt', ptBase),
    'x-default': getCanonicalUrl(pathname, 'es', esBase),
  };
}

/**
 * Memory / Decisiones Técnicas:
 * - `getHreflangLinks`: Rutas como `/precios-ganado` y `/magazine` no existen en Portugal (.PT).
 *   Generar un alternate `pt-PT` para estas URLs provocaría advertencias críticas en Google Search Console
 *   (etiquetas hreflang apuntando a redirecciones 301 o 404). Por ello se omiten explícitamente.
 */
