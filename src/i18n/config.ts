export const locales = {
  es: {
    code: 'es',
    hreflang: 'es-ES',
    prefix: '',
    country: 'ES',
    languageName: 'Español',
    default: true,
  },
  pt: {
    code: 'pt',
    hreflang: 'pt-PT',
    prefix: '/pt',
    country: 'PT',
    languageName: 'Português',
    default: false,
  },
} as const;

export type LocaleCode = keyof typeof locales;

export const ptIndexableRoutes = [
  '/pt',
  '/pt/tratores-usados',
  '/pt/maquinas-agricolas',
  '/pt/alfaias-agricolas',
  '/pt/reboques-agricolas',
  '/pt/pecuaria',
  '/pt/bovinos',
  '/pt/vacas',
  '/pt/touros',
  '/pt/bezerros',
  '/pt/ovelhas',
  '/pt/cabras',
  '/pt/cavalos',
  '/pt/servicos-agricolas',
  '/pt/servicos-pecuarios',
];

export const routeTranslations: Record<string, Record<LocaleCode, string>> = {
  home: {
    es: '/',
    pt: '/',
  },
  tractorsUsed: {
    es: '/tractores-usados',
    pt: '/tratores-usados',
  },
  agriculturalMachinery: {
    es: '/maquinaria-agricola',
    pt: '/maquinas-agricolas',
  },
  agriculturalImplements: {
    es: '/aperos-agricolas',
    pt: '/alfaias-agricolas',
  },
  agriculturalTrailers: {
    es: '/remolques-agricolas',
    pt: '/reboques-agricolas',
  },
  livestock: {
    es: '/ganaderia',
    pt: '/pecuaria',
  },
  cattle: {
    es: '/ganado-bovino',
    pt: '/bovinos',
  },
  cows: {
    es: '/vacas',
    pt: '/vacas',
  },
  bulls: {
    es: '/toros',
    pt: '/touros',
  },
  calves: {
    es: '/terneros',
    pt: '/bezerros',
  },
  sheep: {
    es: '/ovejas',
    pt: '/ovelhas',
  },
  goats: {
    es: '/cabras',
    pt: '/cabras',
  },
  horses: {
    es: '/caballos',
    pt: '/cavalos',
  },
  agriculturalServices: {
    es: '/servicios-agricolas',
    pt: '/servicos-agricolas',
  },
  livestockServices: {
    es: '/servicios-ganaderos',
    pt: '/servicos-pecuarios',
  }
};
