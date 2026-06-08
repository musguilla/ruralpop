import { IS_EQUIPOP } from '../config/tenants';

const RURALPOP_CATEGORIES = [
    {
        id: "ganaderia",
        label: "Ganadería",
        subcategories: [
            "Bovino",
            "Equino",
            "Caprino",
            "Ovino",
            "Porcino",
            "Avicultura",
            "Apicultura",
            "Perros",
            "Conejos",
            "Otros",
        ],
    },
    {
        id: "maquinaria",
        label: "Maquinaria y herramientas",
        subcategories: [
            "Tractores",
            "Abonadoras",
            "Cosechadoras",
            "Desbrozadoras",
            "Encintadoras",
            "Empacadoras",
            "Motocultores",
            "Remolques",
            "Sembradoras",
            "Sulfatadoras",
            "Segadoras",
            "Trituradoras",
            "Volteadoras",
            "Otra maquinaria agrícola"
        ],
    },
    {
        id: "forraje",
        label: "Forraje y alimentación animal",
        subcategories: [],
    },
    {
        id: "fincas",
        label: "Fincas",
        subcategories: [
            "Venta",
            "Alquiler",
            "Traspasos explotaciones"
        ],
    },
    {
        id: "agricultura",
        label: "Agricultura",
        subcategories: [
            "Semillas",
            "Plantas y plantones"
        ],
    },
    {
        id: "servicios",
        label: "Servicios",
        subcategories: [
            "Cerramientos y vallados",
            "Construcción rural",
            "Esquiladores",
            "Herradores",
            "Mantenimiento de fincas",
            "Servicios forestales",
            "Transporte",
            "Veterinarios"
        ],
    },
    {
        id: "alimentos",
        label: "Alimentos",
        subcategories: [],
    },
];

const EQUIPOP_CATEGORIES = [
    { id: "sillas-de-montar-y-accesorios", label: "Sillas de montar y accesorios", subcategories: [] },
    { id: "mantillas-y-sudaderos", label: "Mantillas y sudaderos", subcategories: [] },
    { id: "cabezadas-y-riendas", label: "Cabezadas y riendas", subcategories: [] },
    { id: "protectores-y-vendas", label: "Protectores y vendas", subcategories: [] },
    { id: "mantas-y-ropa-para-caballos", label: "Mantas y ropa para caballos", subcategories: [] },
    { id: "cuidado-e-higiene-del-caballo", label: "Cuidado e higiene del caballo", subcategories: [] },
    { id: "alimentacin-y-suplementos", label: "Alimentación y suplementos", subcategories: [] },
    { id: "herrado-y-cascos", label: "Herrado y cascos", subcategories: [] },
    { id: "trabajo-pie-a-tierra-y-entrenamiento", label: "Trabajo pie a tierra y entrenamiento", subcategories: [] },
    { id: "transporte-y-viaje", label: "Transporte y viaje", subcategories: [] },
    { id: "seguridad-y-visibilidad", label: "Seguridad y visibilidad", subcategories: [] },
    { id: "equipamiento-mdico-y-recuperacin", label: "Equipamiento médico y recuperación", subcategories: [] },
    { id: "establo-y-cuadra", label: "Establo y cuadra", subcategories: [] },
    { id: "reproduccin-y-cra", label: "Reproducción y cría", subcategories: [] },
    { id: "otros-productos-para-caballos", label: "Otros productos para caballos", subcategories: [] },
    { id: "calzado-ecuestre", label: "Calzado ecuestre", subcategories: [] },
    { id: "cascos-y-seguridad", label: "Cascos y seguridad", subcategories: [] },
    { id: "ropa-ecuestre-mujer", label: "Ropa ecuestre mujer", subcategories: [] },
    { id: "ropa-ecuestre-hombre", label: "Ropa ecuestre hombre", subcategories: [] },
    { id: "ropa-ecuestre-infantil", label: "Ropa ecuestre infantil", subcategories: [] },
    { id: "guantes-ecuestres", label: "Guantes ecuestres", subcategories: [] },
    { id: "ropa-reflectante-y-seguridad-vial", label: "Ropa reflectante y seguridad vial", subcategories: [] },
    { id: "fustas-espuelas-y-ayudas", label: "Fustas, espuelas y ayudas", subcategories: [] },
    { id: "accesorios-para-riders", label: "Accesorios para riders", subcategories: [] },
    { id: "equipamiento-de-competicin", label: "Equipamiento de competición", subcategories: [] },
    { id: "outdoor-y-lifestyle-ecuestre", label: "Outdoor y lifestyle ecuestre", subcategories: [] },
    { id: "bolsas-y-almacenamiento", label: "Bolsas y almacenamiento", subcategories: [] },
    { id: "otros-productos-para-riders", label: "Otros productos para riders", subcategories: [] }
];

export const CATEGORIES = IS_EQUIPOP ? EQUIPOP_CATEGORIES : RURALPOP_CATEGORIES;

export const PRICE_TYPES = [
    { id: "fixed", label: "Precio Fijo" },
    { id: "negotiable", label: "Negociable" },
    { id: "exchange", label: "A convenir / Intercambio" },
];
