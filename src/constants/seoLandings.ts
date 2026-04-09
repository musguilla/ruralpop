import { slugify } from "@/utils/seoUtils";

export interface SeoLanding {
    title: string;
    slug: string;
    subtitle?: string;
    category?: string;
    subcategory?: string;
    province?: string;
    searchQuery?: string;
    description: string;
    faqs: { question: string; answer: string }[];
}

const rawLandings = [
    { title: "Venta animales de granja", category: "ganaderia" },
    { title: "Venta de animales en Sevilla", category: "ganaderia", province: "Sevilla" },
    { title: "Venta de Animales en Valencia", category: "ganaderia", province: "Valencia" },
    { title: "Compraventa ganado", category: "ganaderia" },
    { title: "Compraventa ganado Cantabria", category: "ganaderia", province: "Cantabria" },
    { title: "Compraventa ganado País Vasco", category: "ganaderia", province: "País Vasco" },
    { title: "Ganadería en Asturias", category: "ganaderia", province: "Asturias" },
    { title: "Ganadería en Galicia", category: "ganaderia", province: "A Coruña" }, // Galicia represented by one or all? Let's use string "Galicia" and map it later or just search query
    { title: "Ganadería en Salamanca", category: "ganaderia", province: "Salamanca" },
    { title: "Ganadería en Zamora", category: "ganaderia", province: "Zamora" },
    { title: "Ganadería en Extremadura", category: "ganaderia", province: "Cáceres" },
    { title: "Cerdos", category: "ganaderia", subcategory: "Porcino" },
    { title: "Vacas", category: "ganaderia", subcategory: "Bovino" },
    { title: "Segunda mano tractores", subtitle: "Vende y compra tractores de ocasión y seminuevos", category: "maquinaria", searchQuery: "tractor" },
    { title: "Ganado", category: "ganaderia" },
    { title: "Tractores segunda mano", category: "maquinaria", searchQuery: "tractor" },
    { title: "Comprar maquinaria agricola", category: "maquinaria" },
    { title: "Alimentacion del ganado", category: "forraje" },
    { title: "Comprar toro", category: "ganaderia", subcategory: "Bovino", searchQuery: "toro" },
    { title: "Comprar Vaca", category: "ganaderia", subcategory: "Bovino", searchQuery: "vaca" },
    { title: "Vacas en venta", category: "ganaderia", subcategory: "Bovino" },
    { title: "Ganado en venta en Madrid", category: "ganaderia", province: "Madrid" },
    { title: "Ganado en venta en Asturias", category: "ganaderia", province: "Asturias" },
    { title: "Ganado en venta en Sevilla", category: "ganaderia", province: "Sevilla" },
    { title: "Ganado en venta en Galicia", category: "ganaderia", province: "Lugo" },
    { title: "Ganado en venta en Cataluña", category: "ganaderia", province: "Lleida" },
    { title: "Comprar ganado en Madrid", category: "ganaderia", province: "Madrid" },
    { title: "Comprar ganado en Extremadura", category: "ganaderia", province: "Cáceres" },
    { title: "Comprar ganado en País Vasco", category: "ganaderia", province: "Álava" },
    { title: "Comprar ganado en Cantabria", category: "ganaderia", province: "Cantabria" },
];

export const SEO_LANDINGS: SeoLanding[] = rawLandings.map((item) => ({
    ...item,
    slug: slugify(item.title),
    description: `Descubre los mejores anuncios de ${item.title.toLowerCase()} en Ruralpop. El gran mercado agrícola y ganadero de España. Si estás interesado en comprar o vender, aquí encontrarás el mejor entorno de compraventa directo. Encuentra las mejores opciones verificadas y contacta con el vendedor sin intermediarios. Actualizado a diario con clasificados de ${item.title.toLowerCase()}.`,
    faqs: [
        {
            question: "¿Cómo me registro?",
            answer: "Regístrate gratis y empieza a acceder a todas las funcionalidades de Ruralpop. Es muy sencillo sólo tienes que introducir tu número email y una contraseña e inmediatamente podrás acceder al mercado de Ruralpop."
        },
        {
            question: "¿Tiene algún coste utilizar Ruralpop?",
            answer: "Ninguno, puedes descargar la app de forma totalmente gratuita, registrarte y una vez seas miembro de Ruralpop puedes ponerte en contacto con otros ganaderos para comprar o vender."
        },
        {
            question: "¿Como contacto con otro usuario de Ruralpop?",
            answer: "Si te interesa algo de lo que ves, puedes contactar con el usuario que lo publica directamente desde el anuncio, a través del chat. Es totalmente seguro y confidencial. No tendrás que ofrecer ningún dato personal si no quieres."
        },
        {
            question: "¿Es seguro usar Ruralpop?",
            answer: "Totalmente seguro. No tienes que facilitar ningún dato tuyo personal si no quieres. Al configurar tu perfil solo introduces tu nombre, email y contraseña. Si luego conectas con otro miembro de la comunidad y quieres facilitarle más datos a través del chat será una decisión tuya."
        },
        {
            question: `¿Eres un profesional o empresa del sector${item.category === "maquinaria" ? " de la maquinaria agrícola" : ""}?`,
            answer: "Para ti como profesional tenemos diferentes espacios donde ofrecer tus productos y servicios a los ganaderos. Obtendrás la visibilidad que necesitas en el mejor lugar."
        },
        {
            question: `¿Cómo encontrar los mejores anuncios de ${item.title.toLowerCase()}?`,
            answer: `En Ruralpop usamos un sistema de clasificación que muestra los anuncios más recientes y destacados de ${item.title.toLowerCase()}. Puedes usar los filtros superiores para ajustar el precio o la ubicación exacta.`
        },
        {
            question: `¿Es seguro comprar o vender en la categoría de ${item.title.toLowerCase()}?`,
            answer: `Sí, verificamos los perfiles y monitorizamos el contenido. Siempre recomendamos contactar al vendedor a través del sistema de mensajería o por teléfono y organizar una visita presencial antes de realizar cualquier pago relativo a ${item.title.toLowerCase()}.`
        },
        ...(item.title.toLowerCase().includes('tractor') ? [{
            question: "¿Cómo anuncio mi tractor en Ruralpop?",
            answer: "Anunciar tu tractor en Ruralpop es gratis y muy rápido. Solo tienes que descargar la app, registrarte en menos de un minuto y pulsar en el botón de publicar anuncio. Añade buenas fotos, una descripción detallada de tu tractor (marca, modelo, horas, año) y fija el precio. ¡En seguida empezarás a recibir mensajes de compradores interesados!"
        }] : [])
    ]
}));

/**
 * Memory / Decisiones Técnicas:
 * - Se consolida la información de las URLs SEO para usarlas de manera robusta tanto en el footer (Home) como en las páginas de destino dinámicas.
 * - Los textos y FAQs se derivan dinámicamente de forma base para asegurar un empuje inicial en SEO.
 */
