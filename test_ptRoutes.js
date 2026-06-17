const routeTranslations = {
  home: { es: '/', pt: '/' },
  tractorsUsed: { es: '/tractores-usados', pt: '/tratores-usados' },
  magazine: { es: '/magazine', pt: '/magazine' },
  catGanaderia: { es: '/ganaderia', pt: '/pecuaria' },
};

const ptIndexableRoutes = Object.values(routeTranslations).map(route => {
  if (route.pt === '/') return '/pt';
  return route.pt.startsWith('/pt') ? route.pt : `/pt${route.pt}`;
});

console.log([...new Set(ptIndexableRoutes)]);
