import { seoDictionaryPT } from "@/utils/seo/i18n/pt";

const PT_CATEGORY_MAP: Record<string, string> = {
    // Categorías principales Ruralpop
    "ganaderia": "pecuária",
    "pecuaria": "pecuária",
    "maquinaria": "máquinas e ferramentas",
    "maquinas": "máquinas e ferramentas",
    "maquinas-e-ferramentas": "máquinas e ferramentas",
    "fincas": "quintas",
    "quintas": "quintas",
    "forraje": "forragem",
    "forragem": "forragem",
    "alimentos": "alimentos Km0",
    "alimentos-km0": "alimentos Km0",
    "servicios": "serviços",
    "servicos": "serviços",
    "agricultura": "agricultura",
    "recambios-maquinaria": "peças de máquinas",
    "equipamiento-y-material": "equipamento e material",

    // Subcategorías Ganadería
    "bovino": "bovinos",
    "bovinos": "bovinos",
    "equino": "equinos",
    "equinos": "equinos",
    "caprino": "caprinos",
    "caprinos": "caprinos",
    "ovino": "ovinos",
    "ovinos": "ovinos",
    "porcino": "suínos",
    "suinos": "suínos",
    "suínos": "suínos",
    "avicultura": "avicultura",
    "apicultura": "apicultura",
    "perros": "cães",
    "caes": "cães",
    "cães": "cães",
    "conejos": "coelhos",
    "coelhos": "coelhos",
    "otros": "outros",
    "outros": "outros",

    // Términos animales específicos
    "vacas": "vacas",
    "vaca": "vacas",
    "toros": "touros",
    "toro": "touros",
    "touros": "touros",
    "touro": "touros",
    "terneros": "bezerros",
    "ternero": "bezerros",
    "bezerros": "bezerros",
    "bezerro": "bezerros",
    "ovejas": "ovelhas",
    "oveja": "ovelhas",
    "ovelhas": "ovelhas",
    "ovelha": "ovelhas",
    "cabras": "cabras",
    "cabra": "cabras",
    "cabritos": "cabritos",
    "cabrito": "cabritos",
    "caballos": "cavalos",
    "caballo": "cavalos",
    "cavalos": "cavalos",
    "cavalo": "cavalos",

    // Subcategorías Maquinaria
    "tractores": "tratores",
    "tractor": "tratores",
    "tratores": "tratores",
    "trator": "tratores",
    "tractores-agricolas": "tratores",
    "abonadoras": "distribuidores de adubo",
    "cosechadoras": "ceifeiras",
    "ceifeiras": "ceifeiras",
    "desbrozadoras": "roçadoras",
    "rocadoras": "roçadoras",
    "roçadoras": "roçadoras",
    "encintadoras": "plastificadoras",
    "empacadoras": "enfaradadeiras",
    "motocultores": "motocultivadores",
    "remolques": "reboques",
    "reboques": "reboques",
    "sembradoras": "semeadores",
    "sulfatadoras": "pulverizadores",
    "segadoras": "gadanheiras",
    "trituradoras": "trituradores",
    "volteadoras": "viradores",
    "otra maquinaria agrícola": "outras máquinas agrícolas",
    "otra-maquinaria-agricola": "outras máquinas agrícolas",

    // Subcategorías Fincas
    "venta": "venda",
    "venda": "venda",
    "alquiler": "arrendamento",
    "arrendamento": "arrendamento",
    "traspasos": "trespasse de explorações",
    "traspasos-explotaciones": "trespasse de explorações",

    // Subcategorías Agricultura
    "semillas": "sementes",
    "sementes": "sementes",
    "plantas": "plantas e mudas",
    "plantas-y-plantones": "plantas e mudas",

    // Subcategorías Servicios
    "cerramientos": "vedações",
    "cerramientos-y-vallados": "vedações",
    "vedacoes": "vedações",
    "construccion-rural": "construção rural",
    "esquiladores": "tosquiadores",
    "herradores": "ferradores",
    "mantenimiento-de-fincas": "manutenção de quintas",
    "servicios-forestales": "serviços florestais",
    "transporte": "transporte",
    "veterinarios": "veterinários",

    // Categorías Equipop
    "sillas-de-montar-y-accesorios": "selas e acessórios",
    "mantillas-y-salvacruces": "suadouros e amortecedores",
    "cabezadas-y-riendas": "cabeçadas e rédeas",
    "protectores-y-vendas": "caneleiras e ligaduras",
    "mantas": "capas para cavalos",
    "cuidado-e-higiene-del-caballo": "cuidado e higiene do cavalo",
    "herrado-y-cascos": "ferrageamento e cascos",
    "establo-y-cuadra": "estábulos e cavalariças",
    "calzado-ecuestre": "calçado equestre",
    "cascos-y-seguridad": "capacetes e segurança",
    "ropa-ecuestre-mujer": "roupa equestre senhora",
    "ropa-ecuestre-hombre": "roupa equestre homem",
    "ropa-ecuestre-nino": "roupa equestre criança",

    // Generales
    "anuncios": "anúncios"
};

/**
 * Traduce una categoría, subcategoría o consulta de búsqueda al idioma activo.
 */
export function getLocalizedCategoryName(categoryQuery: string, locale: string): string {
    if (locale !== 'pt') {
        return categoryQuery.replace(/-/g, ' ');
    }

    const raw = categoryQuery.trim().toLowerCase();
    if (PT_CATEGORY_MAP[raw]) {
        return PT_CATEGORY_MAP[raw];
    }

    const cleaned = raw.replace(/-/g, ' ');
    if (PT_CATEGORY_MAP[cleaned]) {
        return PT_CATEGORY_MAP[cleaned];
    }

    return cleaned;
}

/**
 * Genera el sufijo de ubicación para el encabezado del bloque SEO principal (ej: ' online', ' en Cáceres', ' no Porto').
 */
export function getLocalizedLocationText(locationName: string | undefined, locale: string): string {
    if (!locationName) return ' online';
    if (locale === 'pt') {
        return ` ${seoDictionaryPT.getPreposition(locationName)}`;
    }
    return ` en ${locationName}`;
}

/**
 * Genera el texto de ubicación para las preguntas frecuentes (ej: '', ' en Cáceres', ' no Porto').
 */
export function getLocalizedFaqLocationText(locationName: string | undefined, locale: string): string {
    if (!locationName) return '';
    if (locale === 'pt') {
        return ` ${seoDictionaryPT.getPreposition(locationName)}`;
    }
    return ` en ${locationName}`;
}

/**
 * Memory / Decisiones Técnicas:
 * - Centraliza el mapeo y formato idiomático para bloques dinámicos SEO y FAQs de final de página.
 * - Integra las contracciones gramaticales de Portugal (`no Porto`, `na Madeira`, `nos Açores`, `em Lisboa`)
 *   para garantizar un tono nativo portugués y libre de discordancias sintácticas.
 */
