import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes - Ruralpop',
    description: 'Encuentra respuestas a las preguntas más frecuentes sobre cómo usar Ruralpop: registrarse, subir anuncios, cuentas profesionales y seguridad en nuestra plataforma rural.',
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
        <div className="min-h-screen bg-[var(--ag-sys-color-background)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Header Area */}
            <div className="bg-[var(--ag-sys-color-surface)] border-b border-[var(--ag-sys-color-border)] py-12 px-4 shadow-sm">
                <div className="container mx-auto max-w-5xl">
                    <h1 className="text-4xl font-extrabold text-[var(--ag-sys-color-text)] mb-4">
                        Preguntas frecuentes
                    </h1>
                    <p className="text-lg text-[var(--ag-sys-color-text-muted)] max-w-2xl">
                        Encuentra las respuestas más rápidas y sencillas sobre cómo utilizar la plataforma Ruralpop.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto max-w-5xl px-4 py-12 flex flex-col md:flex-row gap-12">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 md:flex-shrink-0">
                    <div className="sticky top-24 space-y-8">
                        <nav className="flex flex-col space-y-2">
                            {faqs.map(cat => (
                                <div key={cat.id} className="mb-4">
                                    <Link 
                                        href={`#${cat.id}`} 
                                        className="text-xl font-bold text-[var(--ag-sys-color-text)] hover:text-[var(--ag-sys-color-primary)] transition-colors mb-2 block"
                                    >
                                        {cat.category}
                                    </Link>
                                    <ul className="space-y-2 border-l-2 border-[var(--ag-sys-color-border)] ml-2 pl-4">
                                        {cat.questions.map((q, idx) => (
                                            <li key={idx}>
                                                <Link 
                                                    href={`#${cat.id}-q${idx}`} 
                                                    className="text-sm text-[var(--ag-sys-color-text-muted)] hover:text-[var(--ag-sys-color-text)] transition-colors line-clamp-1"
                                                >
                                                    {q.q}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* FAQ Content */}
                <main className="flex-1 space-y-16">
                    {faqs.map(cat => (
                        <section key={cat.id} id={cat.id} className="scroll-mt-24 space-y-8">
                            <h2 className="text-3xl font-bold text-[var(--ag-sys-color-text)] border-b pb-4">
                                {cat.category}
                            </h2>
                            
                            <div className="space-y-10">
                                {cat.questions.map((q, idx) => (
                                    <article key={idx} id={`${cat.id}-q${idx}`} className="scroll-mt-32">
                                        <h3 className="text-xl font-bold text-[var(--ag-sys-color-text)] mb-4 flex items-start gap-2">
                                            <span className="text-[var(--ag-sys-color-primary)] mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                            </span>
                                            {q.q}
                                        </h3>
                                        <div className="text-[var(--ag-sys-color-text-muted)] leading-relaxed space-y-2 pl-7">
                                            {q.a.split('\n').map((line, lIdx) => (
                                                <p key={lIdx}>{line}</p>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Implementación de un Schema JSON-LD dinámico `FAQPage` vital para SEO (Google Rich Snippets).
 * - Componente Server-side por defecto en app-router para que el indexado sea perfecto.
 * - Sidebar con sticky positioning y anchors al `id` exacto de las secciones.
 */
