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

export const EQUIPOP_CATEGORIES = [
    {
        id: "sillas-de-montar-y-accesorios",
        label: "Sillas de montar y accesorios",
        subcategories: ["Sillas de doma", "Sillas vaqueras", "Sillas de salto", "Sillas de uso general", "Sillas españolas", "Sillas portuguesas", "Sillas de poni", "Cinchas y latiguillos", "Estribos", "Aciones", "Fundas y protectores de silla", "Accesorios para silla"]
    },
    {
        id: "mantillas-y-salvacruces",
        label: "Mantillas y salvacruces",
        subcategories: ["Mantillas de doma", "Mantillas de salto", "Salvacruces", "Otros salvacruces y pads"]
    },
    {
        id: "cabezadas-y-riendas",
        label: "Cabezadas y riendas",
        subcategories: ["Cabezadas de trabajo", "Riendas, alemanas y tijerillas", "Muserolas y frontaleras", "Accesorios para cabezadas", "Cabezadas de cuadra y ramales"]
    },
    {
        id: "bocados-y-filetes",
        label: "Bocados y filetes",
        subcategories: ["Bocados", "Filetes", "Accesorios para bocados y filetes"]
    },
    {
        id: "protectores-y-vendas",
        label: "Protectores y vendas",
        subcategories: ["Protectores delanteros", "Protectores traseros", "Campanas", "Vendas de trabajo", "Vendas de descanso", "Protectores de transporte", "Otros protectores"]
    },
    {
        id: "mantas",
        label: "Mantas",
        subcategories: ["Mantas de invierno", "Mantas impermeables", "Mantas de cuadra", "Mantas de verano", "Mantas de transporte", "Mantas refrescantes", "Cubrenucas", "Cubrecuellos", "Otros textiles para caballo"]
    },
    {
        id: "cuidado-e-higiene-del-caballo",
        label: "Cuidado e higiene del caballo",
        subcategories: ["Cepillos y kits de limpieza", "Productos de higiene", "Champús", "Cuidado del casco", "Cremas y ungüentos", "Aceites y sprays", "Antimoscas", "Cosmética ecuestre"]
    },
    {
        id: "alimentacin-y-suplementos",
        label: "Alimentación y suplementos",
        subcategories: ["Piensos", "Suplementos nutricionales", "Vitaminas", "Electrolitos", "Snacks y premios", "Alimentación premium", "Comederos y bebederos"]
    },
    {
        id: "herrado-y-cascos",
        label: "Herrado y cascos",
        subcategories: ["Botas para cascos", "Herraduras", "Clavos y herramientas", "Productos terapéuticos", "Accesorios de herrado"]
    },
    {
        id: "trabajo-pie-a-tierra-y-entrenamiento",
        label: "Trabajo pie a tierra y entrenamiento",
        subcategories: ["Cuerdas y ramales", "Material de cuerda", "Riendas auxiliares", "Ayudas de entrenamiento", "Material de lunging", "Conos y obstáculos"]
    },
    {
        id: "transporte-y-viaje",
        label: "Transporte y viaje",
        subcategories: ["Protectores de transporte", "Protectores de colas", "Bolsas y maletas ecuestres", "Redes para heno", "Accesorios de remolque", "Cámaras y vigilancia para transporte", "Equipamiento de viaje"]
    },
    {
        id: "seguridad-y-visibilidad",
        label: "Seguridad y visibilidad",
        subcategories: ["Chalecos reflectantes", "Equipamiento LED", "Protectores reflectantes", "Material de seguridad"]
    },
    {
        id: "equipamiento-mdico-y-recuperacin",
        label: "Equipamiento médico y recuperación",
        subcategories: ["Terapia magnética", "Crioterapia", "Masajeadores", "Botas de recuperación", "Equipos veterinarios básicos", "Recuperación muscular"]
    },
    {
        id: "establo-y-cuadra",
        label: "Establo y cuadra",
        subcategories: ["Bebederos automáticos", "Comederos", "Alfombrillas y suelos", "Organización de cuadra", "Material de limpieza", "Accesorios de establo"]
    },
    {
        id: "reproduccin-y-cra",
        label: "Reproducción y cría",
        subcategories: ["Material de reproducción", "Equipamiento veterinario", "Accesorios para potros", "Lactancia y crianza"]
    },
    {
        id: "otros-productos-para-caballos",
        label: "Otros productos para caballos",
        subcategories: ["Vintage ecuestre", "Artesanía", "Coleccionismo", "Decoración ecuestre", "Otros accesorios para caballos"]
    },
    {
        id: "calzado-ecuestre",
        label: "Calzado ecuestre",
        subcategories: ["Botas de Doma", "Botas de Salto", "Botines", "Polainas y chaps", "Calcetines", "Accesorios para calzado"]
    },
    {
        id: "cascos-y-seguridad",
        label: "Cascos y seguridad",
        subcategories: ["Cascos", "Fundas y accesorios para cascos", "Chalecos Airbag", "Espalderas y chalecos protectores", "Accesorios de seguridad"]
    },
    {
        id: "ropa-ecuestre-mujer",
        label: "Ropa ecuestre mujer",
        subcategories: ["Pantalones y leggins", "Polos, Camisetas y tops", "Camisas y polos de competición", "Pantalones de competición", "Chaquetas y Fracs de competición", "Ropa de Abrigo", "Impermeables", "Sudaderas", "Corbatas y plastrones", "Guantes", "Calcetines"]
    },
    {
        id: "ropa-ecuestre-hombre",
        label: "Ropa ecuestre hombre",
        subcategories: ["Pantalones y leggins", "Polos, Camisetas y tops", "Camisas y polos de competición", "Pantalones de competición", "Chaquetas y Fracs de competición", "Ropa de Abrigo", "Impermeables", "Sudaderas", "Corbatas y plastrones", "Guantes", "Calcetines"]
    },
    {
        id: "ropa-ecuestre-infantil",
        label: "Ropa ecuestre infantil",
        subcategories: ["Pantalones y leggins", "Polos, Camisetas y tops", "Camisas y polos de competición", "Pantalones de competición", "Chaquetas y Fracs de competición", "Ropa de Abrigo", "Impermeables", "Sudaderas", "Corbatas y plastrones", "Guantes", "Calcetines"]
    },
    {
        id: "fustas-espuelas-y-ayudas",
        label: "Fustas, espuelas y ayudas",
        subcategories: ["Fustas", "Fustas de doma", "Fustas de salto", "Espuelas", "Correas para espuelas", "Ayudas de entrenamiento", "Otros accesorios de monta"]
    },
    {
        id: "accesorios-para-riders",
        label: "Accesorios para riders",
        subcategories: ["Joyería ecuestre", "Bolsas y mochilas", "Riñoneras", "Gorros y gorras", "Cinturones", "Fundas y accesorios", "Botellas y termos", "Otros accesorios ecuestres"]
    },
    {
        id: "otros-productos-para-riders",
        label: "Otros productos para riders",
        subcategories: ["Vintage ecuestre", "Artesanía ecuestre", "Decoración ecuestre", "Coleccionismo ecuestre", "Otros productos para riders"]
    }
];

export const CATEGORIES = IS_EQUIPOP ? EQUIPOP_CATEGORIES : RURALPOP_CATEGORIES;

export const PRICE_TYPES = [
    { id: "fixed", label: "Precio Fijo" },
    { id: "negotiable", label: "Negociable" },
    { id: "exchange", label: "A convenir / Intercambio" },
];
