export const SEO_TRANSLATIONS: Record<string, string> = {
    // Base keywords
    "anuncios": "anuncios", // We keep 'anuncios' or 'anuncios' in Portuguese (anúncios)
    "ganaderia": "pecuaria",
    "maquinaria": "maquinaria",
    "forraje": "forragem",
    "fincas": "quintas",
    "agricultura": "agricultura",
    "servicios": "servicos",
    "alimentos": "alimentos",
    
    // Subcategories (examples)
    "bovino": "bovino",
    "equino": "equino",
    "caprino": "caprino",
    "ovino": "ovino",
    "porcino": "porcino",
    "avicultura": "avicultura",
    "apicultura": "apicultura",
    "perros": "caes",
    "conejos": "coelhos",
    "otros": "outros",
    "tractores": "tratores",
    "abonadoras": "adubadoras",
    "cosechadoras": "ceifeiras",
    "desbrozadoras": "rocadoras",
    "encintadoras": "envolvedoras",
    "empacadoras": "enfardadeiras",
    "motocultores": "motocultivadores",
    "remolques": "reboques",
    "sembradoras": "semeadoras",
    "sulfatadoras": "pulverizadores",
    "segadoras": "gadanheiras",
    "trituradoras": "trituradores",
    "volteadoras": "viradores",
    "otra-maquinaria-agricola": "outra-maquinaria-agricola",
    "venta": "venda",
    "alquiler": "arrendamento",
    "traspasos-explotaciones": "trespasses-exploracoes",
    "semillas": "sementes",
    "plantas-y-plantones": "plantas-e-mudas",
    "cerramientos-y-vallados": "vedacoes-e-cercas",
    "construccion-rural": "construcao-rural",
    "esquiladores": "tosquiadores",
    "herradores": "ferradores",
    "mantenimiento-de-fincas": "manutencao-de-quintas",
    "servicios-forestales": "servicos-florestais",
    "transporte": "transporte",
    "veterinarios": "veterinarios",

    // Popular Searches
    "vaca": "vaca",
    "toro": "touro",
    "ternero": "vitelos",
    "caballo": "cavalo",
    "yegua": "egua",
    "potro": "potro",
    "cabra": "cabra",
    "oveja": "ovelha",
    "cordero": "cordeiro",
    "cerdo": "porco",
    "gallina": "galinha",
    "perro": "cao",
    "tractor": "trator",
    "remolque": "reboque",
    "cosechadora": "ceifeira",
    "empacadora": "enfardadeira",
    "desbrozadora": "rocadora",
    "arado": "arado",
    "sembradora": "semeadora",
    "abonadora": "adubadora",
    "paja": "palha",
    "alfalfa": "luzerna",
    "avena": "aveia",
    "cebada": "cevada",
    "maiz": "milho",
};

export function translateSeoSlug(slug: string, locale: string): string {
    if (locale !== 'pt') return slug;
    
    // Split by dashes in case it's a multi-word slug and try to match
    // For exact match
    if (SEO_TRANSLATIONS[slug]) {
        return SEO_TRANSLATIONS[slug];
    }
    
    // If it contains dashes and isn't found exactly, we might just return it as is or try to translate parts
    // To keep it simple and avoid messing up locations (like "a-coruna"), we return the slug
    // if not explicitly defined in our translations.
    return slug;
}
