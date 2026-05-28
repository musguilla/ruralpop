import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const posts = [
  {
    slug: "app-gratis-ganaderos-compra-y-vende-ganado",
    title: "App gratis ganaderos - Compra y vende ganado",
    excerpt: "Ruralpop se ha posicionado como la herramienta imprescindible en el bolsillo de cualquier profesional del campo. Descubre cómo miles de ganaderos ya compran y venden ganado directamente desde el móvil, sin comisiones ni intermediarios.",
    category: "Noticias",
    image_url: "/magazine/app-ganaderos.jpg",
    is_published: true,
    published_at: new Date("2025-12-15T10:00:00Z").toISOString(),
    content: `
<p>El día a día en una explotación ganadera apenas deja tiempo para trámites interminables o para estar colgado del teléfono buscando compradores. Hasta hace poco, vender un lote de terneros o buscar maquinaria de segunda mano implicaba depender del boca a boca, de tratantes o de desplazamientos a ferias que muchas veces no daban resultado.</p>
<p>La necesidad de agilizar estos procesos ha convertido a Ruralpop en la app gratis para ganaderos de referencia. La idea es sencilla: llevar el mercado rural tradicional directamente a la pantalla del móvil, permitiendo conectar a miles de profesionales de toda España en tiempo real.</p>

<h2>¿Por qué los ganaderos prefieren una app especializada?</h2>
<p>A diferencia de otras plataformas genéricas donde un anuncio de un tractor se pierde entre ofertas de patinetes o muebles usados, Ruralpop está diseñada exclusivamente para el entorno rural. Los filtros, las categorías y la comunidad de usuarios hablan el mismo idioma.</p>
<p>Cuando alguien busca animales, sabe que va a encontrar vendedores reales. Cuando alguien publica forraje o herramientas agrícolas, sabe que su anuncio llegará exactamente a la gente que lo necesita.</p>

<h2>Compra y vende ganado sin salir de la finca</h2>
<p>El funcionamiento es tan directo como el trato en mano. Si necesitas vender ganado, solo tienes que sacar unas buenas fotos con tu teléfono, añadir los detalles del lote, la raza, la edad y el precio, y en cuestión de un par de minutos tu oferta estará visible para miles de personas.</p>
<p>El chat integrado permite resolver dudas rápidamente, negociar precios y acordar el transporte o la visita a la explotación sin intermediarios.</p>
<ul>
    <li>Publicación de anuncios 100% gratuita y sin límite.</li>
    <li>Filtros específicos por tipo de animal, raza y provincia.</li>
    <li>Contacto directo y seguro a través del sistema de mensajería.</li>
</ul>

<h2>El mercado rural en tu bolsillo</h2>
<p>Además de la compraventa de ganado, Ruralpop se ha convertido en el escaparate ideal para encontrar maquinaria agrícola, herramientas, forraje y servicios profesionales. Todo lo que una granja o finca necesita para funcionar está a un par de clics.</p>
<p>El sector primario está demostrando una enorme capacidad de adaptación tecnológica. Empezar a utilizar herramientas diseñadas a medida, como Ruralpop, marca la diferencia entre perder días buscando clientes o cerrar tratos de forma rápida y efectiva.</p>
`
  },
  {
    slug: "anuncios-ganado-vender-ahora-es-facil",
    title: "Anuncios Ganado. Vender ganado ahora es muy fácil",
    excerpt: "El mercado ganadero se ha modernizado. Colocar anuncios de vacas, ovejas, caballos o cabras nunca había sido tan rápido. Ruralpop conecta a vendedores y compradores reales en cuestión de minutos, agilizando el trato directo.",
    category: "Ganadería",
    image_url: "/magazine/app-ganaderos.jpg",
    is_published: true,
    published_at: new Date("2026-01-05T09:30:00Z").toISOString(),
    content: `
<p>Si llevas años en el sector, sabes perfectamente que vender animales siempre ha requerido mucha paciencia. Avisar a conocidos, contactar con tratantes y esperar a que las noticias circularan por la zona era el procedimiento habitual. Hoy, gracias a las nuevas tecnologías, colocar anuncios de ganado se ha convertido en un proceso rápido, directo y mucho más rentable.</p>
<p>Plataformas especializadas como Ruralpop han cambiado las reglas del juego, demostrando que vender ganado ahora es muy fácil si utilizas la herramienta adecuada.</p>

<h2>Un escaparate abierto 24 horas para tus animales</h2>
<p>El mayor problema de los métodos tradicionales es la limitación geográfica. Por muy bueno que sea el lote de terneras o el rebaño de ovejas que tienes a la venta, si dependes solo de los contactos de tu comarca, estás perdiendo oportunidades. Al publicar anuncios de ganado en Ruralpop, tu oferta llega de forma instantánea a miles de profesionales de todo el país.</p>
<p>Esta exposición ampliada no solo acelera la venta, sino que fomenta precios más justos al aumentar la competencia entre compradores interesados.</p>

<h2>Cómo crear anuncios de ganado que funcionen</h2>
<p>La clave para cerrar tratos rápidos es la transparencia. Los compradores valoran poder ver y entender lo que están adquiriendo antes de hacer un viaje.</p>
<ul>
    <li><strong>Fotos claras y recientes:</strong> Evita imágenes borrosas. Muestra a los animales en su entorno, destacando su estado de salud y conformación.</li>
    <li><strong>Descripción detallada:</strong> Indica la edad, la raza, la calificación sanitaria de la explotación y cualquier dato relevante sobre la genética o la alimentación.</li>
    <li><strong>Precio realista:</strong> Observa cómo está el mercado dentro de Ruralpop y ajusta tus expectativas para atraer a compradores serios.</li>
</ul>

<h2>La seguridad del trato entre profesionales</h2>
<p>Uno de los motivos por los que Ruralpop se ha consolidado como la app líder es el entorno de confianza que ofrece. Al tratarse de una comunidad orientada al 100% al sector agrario, las interacciones son entre profesionales que entienden del negocio.</p>
<p>Ya sea que busques vender unas cuantas cabras, un semental de pura raza o liquidar maquinaria que ya no utilizas, tener el control total sobre tus anuncios y las conversaciones te permite gestionar tus ventas a tu propio ritmo, desde el tractor o desde casa.</p>
`
  },
  {
    slug: "mejor-marca-de-tractor-ganador-2026",
    title: "Mejor marca de tractor - ¿Cuál es el tractor ganador de 2026?",
    excerpt: "Analizamos las tendencias del mercado de maquinaria agrícola para este 2026. John Deere, New Holland, Fendt... descubre qué buscan los profesionales y cómo encontrar los mejores tractores nuevos y de segunda mano en Ruralpop.",
    category: "Maquinaria",
    image_url: "/magazine/app-ganaderos.jpg",
    is_published: true,
    published_at: new Date("2026-01-12T11:15:00Z").toISOString(),
    content: `
<p>El inicio de año siempre trae consigo la misma pregunta en las ferias y cooperativas: ¿cuál es la mejor marca de tractor en la actualidad? Elegir el vehículo adecuado es una de las decisiones más importantes para cualquier agricultor o ganadero, ya que supone una inversión importante y de su rendimiento depende el éxito de la campaña.</p>
<p>A lo largo de 2026, el mercado está marcado por la búsqueda de eficiencia, la reducción de consumo y la tecnología de precisión integrada.</p>

<h2>Las marcas que dominan el terreno</h2>
<p>Aunque el título al mejor tractor siempre dependerá de las necesidades específicas de cada explotación, hay firmas que siguen liderando las encuestas y las ventas de maquinaria nueva y de ocasión.</p>
<p><strong>John Deere</strong> continúa siendo el gigante indiscutible. Su fiabilidad a largo plazo, el extenso servicio técnico y el alto valor de reventa mantienen a sus modelos en la cima. Sus recientes innovaciones en conectividad agrícola lo hacen el favorito para las grandes extensiones.</p>
<p>Por otro lado, <strong>Fendt</strong> sigue coronándose como la opción premium. La eficiencia de su transmisión Vario y el confort en cabina lo convierten en el tractor ganador para quienes pasan interminables jornadas al volante y buscan minimizar el consumo de combustible a toda costa.</p>
<p><strong>New Holland</strong> y <strong>Massey Ferguson</strong> se mantienen como las alternativas más equilibradas. Ofrecen una excelente relación calidad-precio y una enorme versatilidad, siendo las marcas preferidas en las explotaciones mixtas y ganaderas por su agilidad con la pala cargadora.</p>

<h2>El mercado de segunda mano: la opción inteligente</h2>
<p>Con el aumento constante de los precios de la maquinaria nueva, el mercado de ocasión está viviendo una etapa dorada. Un tractor con unas cuantas miles de horas bien mantenido puede ofrecer el mismo rendimiento operativo por una fracción del coste original.</p>
<p>Aquí es donde plataformas como Ruralpop entran en juego, posicionándose como la app líder para encontrar auténticas oportunidades. A través de la aplicación, los usuarios pueden buscar directamente por marca, potencia y ubicación, contactando con vendedores particulares o concesionarios de confianza sin intermediarios.</p>

<h2>Qué buscar al comprar en 2026</h2>
<p>Si estás planteando renovar el parque de maquinaria este año, revisa siempre:</p>
<ul>
    <li>El historial de mantenimientos y reparaciones.</li>
    <li>El estado del sistema hidráulico y la transmisión.</li>
    <li>La disponibilidad de repuestos en tu zona.</li>
    <li>El uso previo del tractor (no sufre igual un tractor de tiro pesado que uno dedicado a labores ligeras o transporte).</li>
</ul>
<p>Ya seas de John Deere, de Fendt o busques un Kubota para tareas de frutales, el mercado actual ofrece opciones para cada perfil de trabajo. Entrar en Ruralpop y revisar los anuncios diarios es el primer paso para encontrar el tractor adecuado al precio justo.</p>
`
  },
  {
    slug: "compraventa-de-ganado-area-ganadera-entre-particulares",
    title: "Compraventa de ganado. Área ganadera entre particulares",
    excerpt: "Las ferias y mercados tradicionales tienen ahora su equivalente digital. Ruralpop ofrece un área ganadera segura y activa donde la compraventa entre particulares se realiza de forma transparente, apoyando la economía de las zonas rurales.",
    category: "Ganadería",
    image_url: "/magazine/app-ganaderos.jpg",
    is_published: true,
    published_at: new Date("2026-01-20T16:45:00Z").toISOString(),
    content: `
<p>El mercado de ganado entre particulares ha sido desde siempre el motor de la economía en nuestras áreas rurales. Históricamente, las ferias comarcales y los mercados de ganado han cumplido esta función, pero los tiempos cambian y las necesidades de los ganaderos requieren soluciones más rápidas y accesibles.</p>
<p>La compraventa de ganado se ha trasladado al entorno digital, y plataformas como Ruralpop han sabido recoger esa esencia del trato cara a cara para convertirla en un área ganadera virtual activa los 365 días del año.</p>

<h2>Un mercado sin fronteras ni horarios</h2>
<p>Una de las grandes ventajas de esta evolución es la eliminación de las barreras físicas. Antes, si querías comprar un buen toro reproductor o buscar una partida de novillas, dependías de lo que hubiera disponible en tu zona o tenías que arriesgarte a hacer kilómetros sin garantías.</p>
<p>Ahora, puedes explorar cientos de explotaciones desde la pantalla de tu móvil. Esto permite a los ganaderos acceder a una genética mucho más variada y a los vendedores encontrar clientes que, de otra forma, jamás habrían conocido su ganadería.</p>

<h2>El trato entre particulares: confianza y rentabilidad</h2>
<p>Evitar intermediarios en la cadena de venta es fundamental para mantener los márgenes de beneficio en las explotaciones familiares. El área ganadera de Ruralpop está diseñada precisamente para eso: poner en contacto directo al que cría con el que compra.</p>
<p>Este sistema de trato directo fomenta la transparencia. El comprador puede preguntar exactamente por la alimentación de los animales, el plan de vacunación o el historial de partos directamente a quien los ha cuidado todos los días.</p>
<ul>
    <li>Negociación directa sobre precios y condiciones de transporte.</li>
    <li>Posibilidad de enviar vídeos y documentación sanitaria a través de la app.</li>
    <li>Acuerdos basados en la palabra y la confianza entre profesionales del campo.</li>
</ul>

<h2>Mucho más que vacas y ovejas</h2>
<p>Aunque la compraventa de ganado bovino, ovino, caprino y equino es el pilar central, este gran mercado virtual abarca todo el ecosistema de la granja. Desde perros de pastoreo hasta forraje, instalaciones ganaderas desmontables y maquinaria para el manejo diario.</p>
<p>Quienes trabajan en el campo saben que el tiempo es dinero. Contar con Ruralpop, la app líder indiscutible para el sector, significa tener siempre a mano un mercado abierto, dinámico y lleno de oportunidades para mejorar la rentabilidad de la explotación.</p>
`
  }
];

async function main() {
  console.log("Inserting 4 new magazine posts...");
  for (const post of posts) {
    const { data, error } = await supabase
      .from('magazine_posts')
      .upsert(post, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error("Error inserting post:", post.slug, error);
    } else {
      console.log("Post inserted successfully:", post.slug);
    }
  }
}

main().catch(console.error);
