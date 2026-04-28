function pluralizeSpanish(text: string): string {
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

export function generateSeoH1(parsedSlug: { q?: string, category?: string, subcategory?: string }, locationName: string = "") {
    const { q, category, subcategory } = parsedSlug;
    let h1 = "";

    if (q) {
        // palabra de la URL o búsqueda en plural + en venta
        const pluralizedQ = pluralizeSpanish(q);
        h1 = `${pluralizedQ} en venta`;
    } else if (subcategory) {
        const sub = subcategory.toLowerCase();
        
        // Ganadería
        if (sub === "bovino") h1 = "Ganado vacuno en venta";
        else if (sub === "equino") h1 = "Ganado equino en venta";
        else if (sub === "caprino") h1 = "Ganado caprino en venta";
        else if (sub === "ovino") h1 = "Ganado ovino en venta";
        else if (sub === "porcino") h1 = "Ganado porcino en venta";
        else if (sub === "avicultura") h1 = "Anuncios compraventa avicultura";
        else if (sub === "apicultura") h1 = "Anuncios compraventa apicultura";
        else if (sub === "perros") h1 = "Anuncios perros";
        else if (sub === "conejos") h1 = "Anuncios conejos";
        // Servicios
        else if (sub === "transporte") h1 = "Transporte de ganado";
        else if (sub === "veterinarios") h1 = "Anuncios veterinarios";
        else if (sub === "herradores") h1 = "Anuncios herradores";
        else if (category === "maquinaria") {
            h1 = `${subcategory} segunda mano`;
        } else {
            h1 = `Anuncios de ${subcategory}`;
        }
    } else if (category) {
        const cat = category.toLowerCase();
        if (cat === "maquinaria") h1 = "Maquinaria de segunda mano";
        else if (cat === "fincas") h1 = "Compra y venta de fincas";
        else if (cat === "forraje") h1 = "Anuncios forraje ganado";
        else if (cat === "alimentos") h1 = "Alimentos Km0";
        else if (cat === "ganaderia") h1 = "Ganado en venta";
        else if (cat === "servicios") h1 = "Servicios para el mundo rural";
        else h1 = `Anuncios de ${category}`;
    } else {
        h1 = "Anuncios clasificados del mundo rural";
    }

    if (h1 && h1.length > 0) {
        h1 = h1.charAt(0).toUpperCase() + h1.slice(1);
    }

    if (locationName) {
        h1 += ` en ${locationName}`;
    }

    return h1;
}
