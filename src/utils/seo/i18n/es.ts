export const seoDictionaryES = {
    inSale: 'en venta',
    livestockCattle: 'Ganado vacuno en venta',
    livestockEquine: 'Ganado equino en venta',
    livestockGoat: 'Ganado caprino en venta',
    livestockSheep: 'Ganado ovino en venta',
    livestockPig: 'Ganado porcino en venta',
    poultry: 'Anuncios compraventa avicultura',
    beekeeping: 'Anuncios compraventa apicultura',
    dogs: 'Anuncios perros',
    rabbits: 'Anuncios conejos',
    transport: 'Transporte de ganado',
    vets: 'Anuncios veterinarios',
    blacksmiths: 'Anuncios herradores',
    machineryUsed: '{subcategory} segunda mano',
    adsOf: 'Anuncios de {subcategory}',
    categoryMachinery: 'Maquinaria de segunda mano',
    categoryEstates: 'Compra y venta de fincas',
    categoryFodder: 'Anuncios forraje ganado',
    categoryFood: 'Alimentos Km0',
    categoryLivestock: 'Ganado en venta',
    categoryServices: 'Servicios para el mundo rural',
    categoryAdsOf: 'Anuncios de {category}',
    defaultGlobal: 'Anuncios clasificados del mundo rural',
    getPreposition: (location: string) => `en ${location}`,
    pluralize: (text: string) => {
        if (!text) return text;
        const stopwords = ['de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'con', 'para', 'y', 'o', 'en', 'sin'];
        return text.split(' ').map(word => {
            const lowerWord = word.toLowerCase();
            if (stopwords.includes(lowerWord)) return word;
            if (lowerWord.endsWith('s')) return word;
            if (lowerWord.endsWith('z')) return word.slice(0, -1) + 'ces';
            
            const lastChar = lowerWord.slice(-1);
            const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
            if (vowels.includes(lastChar)) {
                return word + 's';
            } else {
                return word + 'es';
            }
        }).join(' ');
    }
};
