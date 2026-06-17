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

export const routeTranslations: Record<string, Record<LocaleCode, string>> = {
  home: { es: '/', pt: '/' },
  
  // Custom SEO Landing Pages
  tractorsUsed: { es: '/tractores-usados', pt: '/tratores-usados' },
  agriculturalMachinery: { es: '/maquinaria-agricola', pt: '/maquinas-agricolas' },
  agriculturalImplements: { es: '/aperos-agricolas', pt: '/alfaias-agricolas' },
  agriculturalTrailers: { es: '/remolques-agricolas', pt: '/reboques-agricolas' },
  agriculturalServices: { es: '/servicios-agricolas', pt: '/servicos-agricolas' },
  livestockServices: { es: '/servicios-ganaderos', pt: '/servicos-pecuarios' },

  // Base Next.js Pages
  tractores: { es: '/tractores', pt: '/tractores' },
  magazine: { es: '/magazine', pt: '/magazine' },
  preciosGanado: { es: '/precios-ganado/vacuno', pt: '/precios-ganado/vacuno' },
  lonjaSalamanca: { es: '/precios-ganado/vacuno/mercados/lonja-de-salamanca', pt: '/precios-ganado/vacuno/mercados/lonja-de-salamanca' },
  lonjaSiero: { es: '/precios-ganado/vacuno/mercados/mercado-nacional-de-ganado-de-pola-de-siero', pt: '/precios-ganado/vacuno/mercados/mercado-nacional-de-ganado-de-pola-de-siero' },
  lonjaTalavera: { es: '/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-talavera-de-la-reina', pt: '/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-talavera-de-la-reina' },
  lonjaLeon: { es: '/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-leon', pt: '/precios-ganado/vacuno/mercados/lonja-agropecuaria-de-leon' },

  // MAIN CATEGORIES
  catGanaderia: { es: '/ganaderia', pt: '/pecuaria' },
  catMaquinaria: { es: '/maquinaria', pt: '/maquinas-e-ferramentas' },
  catForraje: { es: '/forraje', pt: '/forragem' },
  catFincas: { es: '/fincas', pt: '/quintas' },
  catAgricultura: { es: '/agricultura', pt: '/agricultura' },
  catServicios: { es: '/servicios', pt: '/servicos' },
  catAlimentos: { es: '/alimentos', pt: '/alimentos-km0' },

  // SUBCATEGORIES: Ganadería
  subBovino: { es: '/bovino', pt: '/bovinos' },
  subEquino: { es: '/equino', pt: '/equinos' },
  subCaprino: { es: '/caprino', pt: '/caprinos' },
  subOvino: { es: '/ovino', pt: '/ovinos' },
  subPorcino: { es: '/porcino', pt: '/suinos' },
  subAvicultura: { es: '/avicultura', pt: '/avicultura' },
  subApicultura: { es: '/apicultura', pt: '/apicultura' },
  subPerros: { es: '/perros', pt: '/caes' },
  subConejos: { es: '/conejos', pt: '/coelhos' },
  subOtros: { es: '/otros', pt: '/outros' },

  // Specific livestock queries mapping
  cows: { es: '/vacas', pt: '/vacas' },
  bulls: { es: '/toros', pt: '/touros' },
  calves: { es: '/terneros', pt: '/bezerros' },
  sheep: { es: '/ovejas', pt: '/ovelhas' },
  goats: { es: '/cabras', pt: '/cabras' },
  horses: { es: '/caballos', pt: '/cavalos' },

  // SUBCATEGORIES: Maquinaria
  subTractores: { es: '/tractores-agricolas', pt: '/tratores' }, // Base /tractores conflicts with Next.js folder, so /tractores-agricolas parses to subcategory "tractores" if mapped
  subAbonadoras: { es: '/abonadoras', pt: '/distribuidores-adubo' },
  subCosechadoras: { es: '/cosechadoras', pt: '/ceifeiras' },
  subDesbrozadoras: { es: '/desbrozadoras', pt: '/rocadoras' },
  subEncintadoras: { es: '/encintadoras', pt: '/plastificadoras' },
  subEmpacadoras: { es: '/empacadoras', pt: '/enfaradadeiras' },
  subMotocultores: { es: '/motocultores', pt: '/motocultivadores' },
  subRemolques: { es: '/remolques', pt: '/reboques' },
  subSembradoras: { es: '/sembradoras', pt: '/semeadores' },
  subSulfatadoras: { es: '/sulfatadoras', pt: '/pulverizadores' },
  subSegadoras: { es: '/segadoras', pt: '/gadanheiras' },
  subTrituradoras: { es: '/trituradoras', pt: '/trituradores' },
  subVolteadoras: { es: '/volteadoras', pt: '/viradores' },
  subOtraMaquinaria: { es: '/otra-maquinaria-agricola', pt: '/outras-maquinas-agricolas' },

  // SUBCATEGORIES: Fincas
  subVenta: { es: '/venta', pt: '/venda' },
  subAlquiler: { es: '/alquiler', pt: '/arrendamento' },
  subTraspasos: { es: '/traspasos-explotaciones', pt: '/trespasse-exploracoes' },

  // SUBCATEGORIES: Agricultura
  subSemillas: { es: '/semillas', pt: '/sementes' },
  subPlantas: { es: '/plantas-y-plantones', pt: '/plantas-e-mudas' },

  // SUBCATEGORIES: Servicios
  subCerramientos: { es: '/cerramientos-y-vallados', pt: '/vedacoes' },
  subConstruccion: { es: '/construccion-rural', pt: '/construcao-rural' },
  subEsquiladores: { es: '/esquiladores', pt: '/tosquiadores' },
  subHerradores: { es: '/herradores', pt: '/ferradores' },
  subMantenimientoFincas: { es: '/mantenimiento-de-fincas', pt: '/manutencao-quintas' },
  subServiciosForestales: { es: '/servicios-forestales', pt: '/servicos-florestais' },
  subTransporte: { es: '/transporte', pt: '/transporte' },
  subVeterinarios: { es: '/veterinarios', pt: '/veterinarios' }
};

export const ptIndexableRoutes = Object.entries(routeTranslations)
  .filter(([key]) => {
    // Exclude magazine and livestock prices from PT sitemap as requested ("SOLO las categorias")
    return !key.includes('magazine') && !key.includes('preciosGanado') && !key.includes('lonja');
  })
  .map(([_, route]) => {
    if (route.pt === '/') return '/pt';
    return route.pt.startsWith('/pt') ? route.pt : `/pt${route.pt}`;
  });
