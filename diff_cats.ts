import fs from 'fs';
import { CATEGORIES } from './src/constants/categories';

const dbCatsRaw = fs.readFileSync('./equipop_cats.json', 'utf8');
const dbCats = JSON.parse(dbCatsRaw);

const codeSubcats = new Set(CATEGORIES.flatMap(c => c.subcategories));
const dbSubcats = new Set(dbCats.flatMap((c: any) => c.subcategories));

console.log("Subcategories in Code but NOT in DB:");
for (const sub of codeSubcats) {
    if (!dbSubcats.has(sub)) {
        console.log(`- ${sub}`);
    }
}

console.log("\nSubcategories in DB but NOT in Code:");
for (const sub of dbSubcats) {
    if (!codeSubcats.has(sub)) {
        console.log(`- ${sub}`);
    }
}
