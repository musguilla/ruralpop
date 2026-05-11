import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const htmlContent = `
<p>En los últimos años, cada vez más profesionales del campo buscan una app para ganaderos que les permita ahorrar tiempo, encontrar compradores reales y gestionar mejor su actividad desde el móvil. Lo que antes dependía de llamadas, grupos de WhatsApp o intermediarios, ahora puede hacerse desde una única plataforma.</p>
<p>Ahí es donde entra Ruralpop, una aplicación creada específicamente para el sector rural y ganadero, pensada para facilitar la compraventa de animales, maquinaria, productos agrícolas y servicios relacionados con el campo.</p>

<h2>Una app pensada para el día a día de los ganaderos</h2>
<p>Muchos marketplaces generalistas no están preparados para las necesidades reales del sector ganadero. En cambio, Ruralpop nace con un enfoque totalmente rural: categorías específicas, búsquedas adaptadas y una comunidad formada por personas del sector.</p>

<p>Con la app puedes:</p>
<ul>
    <li>Publicar anuncios de ganado en pocos minutos</li>
    <li>Comprar y vender animales directamente desde el móvil</li>
    <li>Encontrar maquinaria agrícola y ganadera</li>
    <li>Contactar con compradores y vendedores reales</li>
    <li>Gestionar tus anuncios fácilmente</li>
    <li>Descubrir productos y servicios para explotaciones rurales</li>
    <li>Hablar con otros profesionales del sector</li>
</ul>
<p>Además, Ruralpop sigue incorporando nuevas funcionalidades para facilitar aún más la actividad diaria de agricultores y ganaderos.</p>

<h2>App gratis para ganaderos: publica y vende sin complicaciones</h2>
<p>Uno de los aspectos más valorados por los usuarios es que Ruralpop funciona como una app gratis para ganaderos, permitiendo publicar anuncios y acceder a miles de ofertas rurales desde cualquier lugar.</p>
<p>No hace falta tener conocimientos técnicos ni pasar horas configurando perfiles complejos. La idea es simple: abrir la aplicación, publicar y empezar a conectar con personas interesadas.</p>
<p>Cada día más profesionales utilizan Ruralpop para:</p>
<ul>
    <li>Venta de vacas, terneros, ovejas, caballos o cabras</li>
    <li>Compra y venta de maquinaria de segunda mano</li>
    <li>Comercialización de productos rurales</li>
    <li>Búsqueda de servicios agrícolas y ganaderos</li>
    <li>Contacto entre explotaciones y profesionales del campo</li>
</ul>

<h2>Venta online dentro de la app</h2>
<p>La digitalización del sector rural ya es una realidad. Por eso, Ruralpop también incorpora funciones de venta online dentro de la propia aplicación, permitiendo que compradores y vendedores puedan cerrar operaciones de forma más rápida y cómoda.</p>
<p>El objetivo es convertir Ruralpop en mucho más que una plataforma de anuncios: una herramienta útil para el día a día del sector rural.</p>
<p>Cada vez más usuarios utilizan la app para generar contactos comerciales, mover animales, encontrar maquinaria o dar salida a productos relacionados con la ganadería y la agricultura.</p>

<h2>Una comunidad rural en crecimiento</h2>
<p>El crecimiento de Ruralpop está demostrando que el sector necesitaba una plataforma moderna, especializada y adaptada al mundo rural actual.</p>
<p>Mientras otras aplicaciones están pensadas para un público generalista, Ruralpop pone el foco en quienes viven y trabajan en el campo. Esa especialización hace que los anuncios sean más relevantes y que las conexiones entre usuarios tengan mucho más valor.</p>
<p>La app ya reúne miles de anuncios relacionados con:</p>
<ul>
    <li>Ganadería</li>
    <li>Agricultura</li>
    <li>Maquinaria</li>
    <li>Servicios rurales</li>
    <li>Animales</li>
    <li>Fincas</li>
    <li>Alimentación rural</li>
    <li>Productos km0</li>
</ul>

<h2>¿Por qué cada vez más ganaderos usan Ruralpop?</h2>
<p>Porque permite ahorrar tiempo, ampliar la red de contactos y acceder a oportunidades reales desde cualquier lugar.</p>
<p>Con el móvil, un ganadero puede publicar un anuncio, responder mensajes, negociar una venta o encontrar maquinaria sin necesidad de desplazarse.</p>
<p>Además, la plataforma está diseñada para ser rápida, intuitiva y fácil de utilizar tanto desde Android como desde iPhone.</p>

<h2>Descarga la app para ganaderos Ruralpop</h2>
<p>Si buscas una app para ganaderos gratis, especializada en el sector rural y preparada para comprar y vender online, Ruralpop se está convirtiendo en una de las opciones más completas del mercado.</p>
<p>Tanto si tienes una explotación ganadera como si trabajas en agricultura, maquinaria o servicios rurales, la aplicación te permite conectar con miles de personas del sector desde un único lugar.</p>
<p>El mundo rural también evoluciona. Y cada vez más profesionales lo hacen desde el móvil.</p>
`;

async function main() {
    const post = {
        slug: "app-para-ganaderos-gratis",
        title: "La app para ganaderos que está revolucionando el mundo rural",
        excerpt: "Descubre Ruralpop, la app para ganaderos gratis donde puedes comprar y vender ganado, maquinaria, animales y encontrar productos km0. Publica anuncios, contacta con profesionales y gestiona tus ventas desde el móvil.",
        category: "Noticias",
        image_url: "/magazine/app-ganaderos.jpg",
        content: htmlContent,
        is_published: true,
        published_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('magazine_posts')
        .upsert(post, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error("Error inserting post:", error);
    } else {
        console.log("Post inserted successfully!", data);
    }
}

main();
