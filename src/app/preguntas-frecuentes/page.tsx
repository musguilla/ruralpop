import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes - Ruralpop',
    description: 'Encuentra respuestas a las preguntas más frecuentes sobre cómo usar Ruralpop: registrarse, subir anuncios, cuentas profesionales y seguridad en nuestra plataforma rural.',
    alternates: { canonical: "/preguntas-frecuentes" }
};

export default function FAQPage() {
    // FAQ Data definition for both rendering and Schema.org
    const faqs = [
        {
            category: 'Cuenta',
            id: 'cuenta',
            questions: [
                {
                    q: '¿Cómo me registro en Ruralpop?',
                    a: '1. Haz clic en el icono de usuario o "Entrar / Registro" en la parte superior derecha de la pantalla.\n2. Selecciona "Crear cuenta" o usa directamente tu cuenta de Google o Apple para acceder rápidamente.\n3. Rellena tus datos básicos y ¡listo! Ya eres parte de la comunidad.'
                },
                {
                    q: '¿Cómo elimino mi cuenta?',
                    a: '1. Inicia sesión y ve a tu "Perfil" en la esquina superior derecha.\n2. Haz clic en "Configuración".\n3. En la parte inferior, verás la opción "Eliminar cuenta". Pulsa ahí y sigue los pasos de seguridad para confirmar tu solicitud.'
                },
                {
                    q: '¿Cómo contacto con otro usuario por chat?',
                    a: '1. Encuentra un anuncio que te interese.\n2. En la página del anuncio, haz clic en el botón "Contactar".\n3. Escribe tu mensaje y el usuario lo recibirá al instante en su buzón de Ruralpop y por correo electrónico.'
                },
                {
                    q: '¿Es seguro usar Ruralpop?',
                    a: '1. Sí. Verificamos constantemente las cuentas profesionales.\n2. Contamos con un sistema de reportes en cada anuncio por si ves algo sospechoso.\n3. Mantenemos tu privacidad intacta: tus datos de contacto no son públicos a menos que tú decidas compartirlos.'
                },
                {
                    q: '¿Eres profesional o empresa del sector?',
                    a: '1. Si tienes una explotación ganadera, eres un concesionario de maquinaria, o una tienda.\n2. Te recomendamos crear directamente una cuenta Profesional para disfrutar de tu propio escaparate digital y subir anuncios sin límite.'
                }
            ]
        },
        {
            category: 'Anuncios',
            id: 'anuncios',
            questions: [
                {
                    q: '¿Cómo subo un anuncio a Ruralpop?',
                    a: '1. Una vez logueado, haz clic en el botón verde "Vender" de la barra superior.\n2. Selecciona la categoría principal y subcategoría para tu producto o animal.\n3. Sube fotos claras, pon un título descriptivo y un precio.\n4. Revisa los datos y dale a publicar. Ya estará visible para miles de personas.'
                },
                {
                    q: '¿Cuántos anuncios puedo subir?',
                    a: '1. Si eres un usuario Particular, puedes subir un número limitado de anuncios gratuitos activos al mismo tiempo.\n2. Si eres Profesional o Empresa, puedes pasarte a un Plan Pro y subir tantos catálogos de productos como tu negocio necesite.'
                },
                {
                    q: '¿Cómo puedo destacar mis anuncios?',
                    a: '1. Entra a tu perfil y luego a tus "Anuncios".\n2. Al lado del anuncio que quieras potenciar, verás una opción "Destacar".\n3. Estos anuncios aparecerán siempre arriba en las búsquedas y tendrán un resaltado especial.'
                },
                {
                    q: '¿Cómo elimino un anuncio?',
                    a: '1. Ve a "Mis Anuncios" desde tu menú de perfil.\n2. Localiza el anuncio a borrar.\n3. Accede a sus opciones (los tres puntitos) y selecciona "Eliminar". Se retirará de inmediato de la web.'
                }
            ]
        },
        {
            category: 'Profesionales',
            id: 'profesionales',
            questions: [
                {
                    q: 'Crear cuenta de profesional',
                    a: '1. Dirígete a la sección "Profesionales" en la página de inicio o en el menú.\n2. Selecciona y paga la suscripción que mejor se adapte (mensual o anual).\n3. Rellena los datos fiscales y de contacto público de tu negocio.'
                },
                {
                    q: 'Beneficios cuentas profesionales',
                    a: '1. Tu propia página web (landing page) con la URL ruralpop.com/empresa/tu-nombre.\n2. Publicación de anuncios ilimitados sin caducidad.\n3. Etiqueta destacada en tus anuncios que da mayor confianza a los compradores.\n4. Estadísticas detalladas de visualizaciones y contactos recibidos.'
                }
            ]
        }
    ];

    // Build the Schema.org JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.flatMap(cat => cat.questions.map(q => ({
            "@type": "Question",
            "name": q.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q.a.replace(/\n/g, ' ')
            }
        })))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FAQClient faqs={faqs} />
        </>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Implementación de un Schema JSON-LD dinámico `FAQPage` vital para SEO (Google Rich Snippets).
 * - Componente Server-side por defecto en app-router para que el indexado sea perfecto.
 * - Delegate to FAQClient for the interactive visual layout.
 */
