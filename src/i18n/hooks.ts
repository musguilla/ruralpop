'use client';

import { useTranslation } from '@/context/LocaleContext';
import { getInternalSpanishRoute, getRouteByKey } from './utils';

export const useLocalizedRoute = () => {
  const { locale } = useTranslation();

  const getPath = (internalPath: string) => {
    // If it's already localized for current locale, return as is
    if (locale === 'pt' && internalPath.startsWith('/pt')) {
      return internalPath;
    }

    // Try to find if this internal path maps to a known route key
    const { routeKey } = getInternalSpanishRoute(internalPath);
    
    if (routeKey) {
      return getRouteByKey(routeKey, locale);
    }

    // If it's not a known translated route but we are in PT, prefix it
    if (locale === 'pt') {
      return `/pt${internalPath === '/' ? '' : internalPath}`;
    }

    return internalPath;
  };

  return { getPath };
};
