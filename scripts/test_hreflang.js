const { getHreflangLinks, getCanonicalUrl } = require('./src/i18n/utils.ts');

console.log("Testing Spanish page /anuncios-toledo:");
console.log(getHreflangLinks('/anuncios-toledo'));

console.log("\nTesting Portuguese page /pt/anuncios-toledo:");
console.log(getHreflangLinks('/pt/anuncios-toledo'));
