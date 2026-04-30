const { buildSeoUrl, parseSeoUrl } = require('./src/utils/seoUtils.ts');

console.log(buildSeoUrl({ q: "anuncios", province_id: "m_coruña" }));
