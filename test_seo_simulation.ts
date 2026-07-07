import { buildSeoUrl, parseSeoUrl } from './src/utils/seoUtils';

// 1. User starts with query from the old bug
let currentQuery = "anuncios sillas de montar sillas de montar";

// 2. User clicks "Sillas de uso general"
let newUrl = buildSeoUrl({
    q: currentQuery,
    category: "sillas-de-montar-y-accesorios",
    subcategory: "Sillas de uso general"
});
console.log("URL 1:", newUrl);

// 3. Parser parses it
let parsed1 = parseSeoUrl(newUrl);
console.log("PARSED 1:", parsed1);

// 4. User clicks another subcategory? Let's say they just click "Sillas de uso general" again or something
let newUrl2 = buildSeoUrl({
    q: parsed1.q,
    category: "sillas-de-montar-y-accesorios",
    subcategory: "Sillas de uso general"
});
console.log("URL 2:", newUrl2);
let parsed2 = parseSeoUrl(newUrl2);
console.log("PARSED 2:", parsed2);
