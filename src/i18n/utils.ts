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
export function getInternalSpanishRoute(pathname: string): { routeKey: string | null, internalPath: string } {
  const locale = getLocaleFromPath(pathname);
  
  if (locale === 'es') {
    // Determine routeKey if it's a known route
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

  // If locale is pt, remove the /pt prefix
  let ptSlug = pathname.replace(/^\/pt(\/|$)/, '/');
  if (ptSlug === '') ptSlug = '/';
  
  // Find in routeTranslations
  for (const [key, tr] of Object.entries(routeTranslations)) {
    if (tr.pt === ptSlug) {
      return { routeKey: key, internalPath: tr.es }; // Return the spanish equivalent
    }
  }

  // If not found in translations, fallback to exact matching of slug
  // i.e., /pt/anuncio/123 -> /anuncio/123
  return { routeKey: null, internalPath: ptSlug };
}

/**
 * Gets a translated route given a key and locale
 */
export function getRouteByKey(routeKey: string, targetLocale: LocaleCode): string {
  const tr = routeTranslations[routeKey];
  if (!tr) return '/';
  
  const path = tr[targetLocale];
  const prefix = locales[targetLocale].prefix;
  
  if (path === '/') return prefix || '/';
  return `${prefix}${path}`;
}

/**
 * Given a pathname (in any locale), generates the full canonical URL for a specific locale
 */
export function getCanonicalUrl(pathname: string, targetLocale: LocaleCode, domain: string = 'https://www.ruralpop.com'): string {
  const { routeKey, internalPath } = getInternalSpanishRoute(pathname);
  
  let targetPath = '';
  
  if (routeKey) {
    // It's a known translated route
    targetPath = getRouteByKey(routeKey, targetLocale);
  } else {
    // Dynamic or untranslated route. Just prepend prefix
    const prefix = locales[targetLocale].prefix;
    targetPath = internalPath === '/' ? (prefix || '/') : `${prefix}${internalPath}`;
  }
  
  return `${domain}${targetPath}`;
}

/**
 * Returns hreflang alternates
 */
export function getHreflangLinks(pathname: string, domain: string = 'https://www.ruralpop.com') {
  return {
    'es-ES': getCanonicalUrl(pathname, 'es', domain),
    'pt-PT': getCanonicalUrl(pathname, 'pt', domain),
    'x-default': getCanonicalUrl(pathname, 'es', domain),
  };
}
