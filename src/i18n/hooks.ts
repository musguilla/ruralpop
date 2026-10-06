'use client';

import { useTranslation } from '@/context/LocaleContext';
import { getInternalSpanishRoute, getRouteByKey } from './utils';

export const useLocalizedRoute = () => {
  const { locale } = useTranslation();
  const isDomainPt = typeof window !== 'undefined' && window.location.hostname.includes('ruralpop.pt');

  const getPath = (internalPath: string) => {
    // Si ya tiene /pt en ruralpop.pt, limpiarlo
    if (isDomainPt && (internalPath === '/pt' || internalPath.startsWith('/pt/'))) {
      const clean = internalPath.replace(/^\/pt(\/|$)/, '/');
      return clean === '' ? '/' : clean;
    }

    // If it's already localized for current locale on standard domain, return as is
    if (!isDomainPt && locale === 'pt' && internalPath.startsWith('/pt')) {
      return internalPath;
    }

    // Try to find if this internal path maps to a known route key
    const { routeKey } = getInternalSpanishRoute(internalPath);
    
    if (routeKey) {
      return getRouteByKey(routeKey, locale, isDomainPt);
    }

    // If it's not a known translated route but we are in PT:
    if (locale === 'pt') {
      if (isDomainPt) {
        return internalPath;
      }
      return `/pt${internalPath === '/' ? '' : internalPath}`;
    }

    return internalPath;
  };

  return { getPath };
};

/**
 * Memory / Decisiones Técnicas:
 * - Detección de `isDomainPt`: en `ruralpop.pt` el dominio nacional ya identifica el país y el idioma,
 *   por lo que anteponer `/pt/` a todas las URLs es redundante y perjudicial para el SEO local.
 *   `useLocalizedRoute` genera URLs canónicas limpias como `/pecuaria` o `/tratores`.
 */
