export const seoDictionaryPT = {
    inSale: 'à venda',
    livestockCattle: 'Gado bovino à venda',
    livestockEquine: 'Cavalos e equinos à venda',
    livestockGoat: 'Caprinos à venda',
    livestockSheep: 'Ovinos à venda',
    livestockPig: 'Suínos à venda',
    poultry: 'Anúncios de aves',
    beekeeping: 'Anúncios de apicultura',
    dogs: 'Anúncios de cães',
    rabbits: 'Anúncios de coelhos',
    transport: 'Transporte de gado',
    vets: 'Anúncios veterinários',
    blacksmiths: 'Anúncios de ferradores',
    machineryUsed: '{subcategory} em segunda mão',
    adsOf: 'Anúncios de {subcategory}',
    categoryMachinery: 'Máquinas em segunda mão',
    categoryEstates: 'Compra e venda de propriedades',
    categoryFodder: 'Anúncios forragem para gado',
    categoryFood: 'Alimentos Km0',
    categoryLivestock: 'Gado à venda',
    categoryServices: 'Serviços para o mundo rural',
    categoryAdsOf: 'Anúncios de {category}',
    defaultGlobal: 'Anúncios classificados do mundo rural',
    getPreposition: (location: string) => {
        const lowerLoc = location.toLowerCase();
        if (['porto', 'algarve', 'alentejo'].includes(lowerLoc)) return `no ${location}`;
        if (['madeira', 'galiza'].includes(lowerLoc)) return `na ${location}`;
        if (['açores'].includes(lowerLoc)) return `nos ${location}`;
        return `em ${location}`;
    },
    pluralize: (text: string) => {
        if (!text) return text;
        const stopwords = ['de', 'da', 'do', 'das', 'dos', 'a', 'as', 'o', 'os', 'um', 'uma', 'com', 'para', 'e', 'ou', 'em', 'sem'];
        return text.split(' ').map(word => {
            const lowerWord = word.toLowerCase();
            if (stopwords.includes(lowerWord)) return word;
            if (lowerWord.endsWith('s')) return word;
            if (lowerWord.endsWith('m')) return word.slice(0, -1) + 'ns';
            if (lowerWord.endsWith('l')) return word.slice(0, -1) + 'is';
            if (lowerWord.endsWith('ão')) return word.slice(0, -2) + 'ões'; // Simplificação, pode ser ães/ãos
            
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
