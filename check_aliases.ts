import { CATEGORIES } from './src/constants/categories';

const CATEGORY_ALIASES: Record<string, string> = {
    "sillas-de-montar-y-accesorios": "sillas-de-montar",
    "mantillas-y-sudaderos": "mantillas",
    "cabezadas-y-riendas": "cabezadas",
    "protectores-y-vendas": "protectores",
    "mantas-y-ropa-para-caballos": "mantas-caballos",
    "cuidado-e-higiene-del-caballo": "cuidado-caballo",
    "alimentacin-y-suplementos": "alimentacion",
    "herrado-y-cascos": "herrado",
    "trabajo-pie-a-tierra-y-entrenamiento": "trabajo-pie-a-tierra",
    "transporte-y-viaje": "transporte",
    "seguridad-y-visibilidad": "seguridad",
    "equipamiento-mdico-y-recuperacin": "equipamiento-medico",
    "establo-y-cuadra": "establo",
    "reproduccin-y-cra": "reproduccion",
    "otros-productos-para-caballos": "otros-caballos",
    "calzado-ecuestre": "calzado",
    "cascos-y-seguridad": "cascos",
    "ropa-ecuestre-mujer": "ropa-mujer",
    "ropa-ecuestre-hombre": "ropa-hombre",
    "ropa-ecuestre-infantil": "ropa-infantil",
    "guantes-ecuestres": "guantes",
    "ropa-reflectante-y-seguridad-vial": "ropa-reflectante",
    "fustas-espuelas-y-ayudas": "fustas-espuelas",
    "accesorios-para-riders": "accesorios-riders",
    "equipamiento-de-competicin": "competicion",
    "outdoor-y-lifestyle-ecuestre": "outdoor",
    "bolsas-y-almacenamiento": "bolsas",
    "otros-productos-para-riders": "otros-riders"
};

const validCategories = new Set(CATEGORIES.map(c => c.id));

for (const key of Object.keys(CATEGORY_ALIASES)) {
    if (!validCategories.has(key)) {
        console.log("Missing valid category for alias key: " + key);
    }
}
