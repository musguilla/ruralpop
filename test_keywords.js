

function testLogic(title, description, tags, category, subcategory) {
    let isRestricted = false;
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    const lowerTags = tags.map(t => t.toLowerCase());
    
    if (subcategory && subcategory.toLowerCase() === "perros") {
        isRestricted = true;
    } else {
        const restrictedKeywords = ["agaporni", "ninfa", "periquito", "cotorra", "canario", "loro", "lorito", "papillero", "papillera", "anillado", "anillada", "paloma", "palomas", "palomo", "palomos"];
        const combinedText = `${lowerTitle} ${lowerDesc} ${lowerTags.join(" ")}`;
        
        for (const word of restrictedKeywords) {
            if (combinedText.includes(word)) {
                isRestricted = true;
                break;
            }
        }
    }
    return isRestricted;
}

console.log("Test 1 - Loro:", testLogic("Loro", "Loro", [], "ganaderia", "Otros"));
console.log("Test 2 - agapornis:", testLogic("agapornis", "", [], "ganaderia", "Avicultura"));
