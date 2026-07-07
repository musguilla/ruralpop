import { buildSeoUrl, parseSeoUrl } from './src/utils/seoUtils';
console.log("BUILD:", buildSeoUrl({ q: '', category: 'sillas-de-montar-y-accesorios', subcategory: 'Sillas de uso general' }));
console.log("PARSE:", parseSeoUrl("anuncios-sillas-de-montar-sillas-de-montar-sillas-mixtas-uso-general"));
