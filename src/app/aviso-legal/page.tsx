import React from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aviso Legal | Ruralpop",
    description: "Aviso legal, condiciones de navegación y responsabilidades del sitio web de Ruralpop.",
};

export default function AvisoLegalPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Aviso Legal</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Sitio Web y Aplicación Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">¿Quién es el titular del sitio web y la aplicación Ruralpop?</h2>
                    <p>El presente sitio web y, en su caso, la aplicación móvil de Ruralpop son titularidad de:</p>
                    <ul className="list-none space-y-1">
                        <li><strong>Identidad:</strong> Luis Sánchez Fernández (“Ruralpop”)</li>
                        <li><strong>Actividad:</strong> Plataforma digital de anuncios clasificados del sector rural</li>
                        <li><strong>Domicilio social:</strong> Lugar Navaliega, Asturias</li>
                        <li><strong>NIF:</strong> 09440100A</li>
                        <li><strong>Correo electrónico de contacto Protección de Datos:</strong> privacidad@ruralpop.com</li>
                    </ul>

                    <p>
                        Este Aviso Legal establece las condiciones que regulan el acceso, navegación y uso del sitio web de Ruralpop y, en su caso, de su aplicación móvil, incluyendo la mera navegación por cualquiera de ellos.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Accesibilidad</h2>
                    <p>
                        Un sitio web es accesible cuando su acceso y uso puede realizarse por cualquier persona, con independencia de sus limitaciones personales o de las limitaciones derivadas de su entorno o del dispositivo utilizado.
                    </p>
                    <p>
                        En Ruralpop procuramos mejorar continuamente la accesibilidad del sitio web y de la aplicación, con el objetivo de facilitar el acceso a sus contenidos y servicios al mayor número de usuarios posible.
                    </p>
                    <p>
                        Ruralpop podrá interrumpir temporalmente el acceso al sitio web o a la aplicación por motivos de seguridad, mantenimiento técnico, actualización, incidencias de suministro o cualquier otra causa técnica. Cuando ello sea posible, se informará a los usuarios de dichas interrupciones.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Acceso y uso del sitio web y de la aplicación</h2>
                    <p>
                        El acceso, navegación o uso del sitio web y/o de la aplicación de Ruralpop atribuye a quien lo realiza la condición de usuario e implica la aceptación del presente Aviso Legal desde el momento en que se produce dicho acceso.
                    </p>
                    <p>
                        El acceso a determinados servicios o funcionalidades puede requerir el registro previo del usuario y la aceptación adicional de los correspondientes Términos y Condiciones de Uso, así como de la Política de Privacidad y la Política de Cookies, que completarán o sustituirán, según corresponda, lo previsto en este Aviso Legal.
                    </p>
                    <p>
                        Ruralpop no garantiza la disponibilidad permanente, la continuidad absoluta ni la ausencia de errores en el funcionamiento del sitio web o de la aplicación. En la medida permitida por la legislación aplicable, Ruralpop no será responsable de los daños o perjuicios que pudieran derivarse de interrupciones del servicio, caídas, errores técnicos, virus, interferencias de terceros, incidencias en redes de telecomunicaciones, fuerza mayor o cualesquiera otras circunstancias ajenas a su control razonable.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Propiedad intelectual e industrial</h2>
                    <p>
                        Ruralpop es titular o, en su caso, cuenta con licencia o autorización suficiente sobre los derechos de propiedad intelectual e industrial del sitio web, la aplicación y todos sus contenidos, incluyendo, a título enunciativo y no limitativo, textos, imágenes, diseños, logotipos, marcas, nombres comerciales, vídeos, audios, bases de datos, estructura, software, código fuente, funcionalidades y demás elementos que los integran.
                    </p>
                    <p>
                        El usuario se compromete a respetar todos los derechos de propiedad intelectual e industrial titularidad de Ruralpop o de terceros.
                    </p>
                    <p>
                        Queda expresamente prohibida la reproducción, distribución, transformación, comunicación pública, puesta a disposición, extracción, reutilización o cualquier otra forma de explotación, total o parcial, del contenido del sitio web o de la aplicación, por cualquier medio o procedimiento, salvo autorización expresa y por escrito del titular de los derechos correspondientes o en los supuestos legalmente permitidos.
                    </p>
                    <p>
                        Las marcas, nombres comerciales o signos distintivos que aparezcan en el sitio web o en la aplicación son titularidad de Ruralpop o de terceros, sin que pueda entenderse que el acceso o uso atribuya al usuario derecho alguno sobre los mismos.
                    </p>
                    <p className="font-bold">
                        Copyright Ruralpop &copy; 2026 – Todos los derechos reservados
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Protección de Datos y Cookies</h2>
                    <p>
                        Ruralpop, como titular del sitio web y de la aplicación, cumple con el Reglamento (UE) 2016/679, la Ley Orgánica 3/2018, la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, y demás normativa aplicable en materia de protección de datos y servicios digitales.
                    </p>
                    <p>
                        Ruralpop vela por garantizar un tratamiento adecuado de los datos personales de los usuarios, así como un uso correcto de cookies y tecnologías similares.
                    </p>
                    <p>
                        Para más información, puedes consultar la Política de Privacidad y la Política de Cookies de Ruralpop.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Modificaciones</h2>
                    <p>
                        Ruralpop se reserva el derecho de modificar en cualquier momento el presente Aviso Legal, así como el diseño, configuración, contenidos, especificaciones técnicas, funcionalidades y servicios del sitio web o de la aplicación, de forma unilateral y sin necesidad de previo aviso, sin perjuicio de los derechos que correspondan a los usuarios conforme a la normativa aplicable.
                    </p>
                    <p>
                        Las modificaciones serán publicadas en el sitio web y/o en la aplicación desde el momento en que entren en vigor.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Enlaces</h2>
                    <p>
                        En caso de que el sitio web o la aplicación incluyan enlaces o hipervínculos a otros sitios de Internet gestionados por terceros, Ruralpop no ejercerá control alguno sobre dichos sitios ni sobre sus contenidos.
                    </p>
                    <p>
                        En ningún caso Ruralpop asumirá responsabilidad alguna por los contenidos, políticas, prácticas o disponibilidad técnica de sitios web de terceros enlazados desde su plataforma, ni garantizará la fiabilidad, exactitud, legalidad, validez o actualidad de los materiales o informaciones contenidos en ellos.
                    </p>
                    <p>
                        La inclusión de estos enlaces no implicará, en ningún caso, asociación, fusión, colaboración o participación alguna entre Ruralpop y las entidades enlazadas, salvo que se indique expresamente lo contrario.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Generalidades</h2>
                    <p>
                        El usuario se compromete a hacer un uso correcto, diligente y lícito del sitio web, de la aplicación y de sus contenidos y servicios, de conformidad con la legislación aplicable, el presente Aviso Legal, los Términos y Condiciones de Uso, la Política de Privacidad, la Política de Cookies, la buena fe, las buenas costumbres y el orden público.
                    </p>
                    <p>En particular, el usuario se abstendrá de:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Utilizar el sitio web, la aplicación o sus servicios con fines ilícitos, fraudulentos o contrarios a la buena fe.</li>
                        <li>Introducir, difundir o facilitar contenidos ilícitos, ofensivos, engañosos, discriminatorios, difamatorios o que vulneren derechos de terceros.</li>
                        <li>Dañar, inutilizar, sobrecargar, deteriorar o impedir el normal funcionamiento del sitio web, de la aplicación o de los sistemas que los soportan.</li>
                        <li>Acceder o intentar acceder a áreas restringidas, cuentas de terceros o sistemas sin autorización.</li>
                        <li>Realizar actos de ingeniería inversa, extracción masiva de datos, scraping, copia automatizada o cualquier conducta que perjudique a Ruralpop o a otros usuarios.</li>
                    </ul>
                    <p>
                        Ruralpop podrá adoptar cuantas medidas técnicas, legales u organizativas resulten necesarias ante incumplimientos del presente Aviso Legal o del resto de textos legales de la plataforma, incluyendo la suspensión o cancelación del acceso, sin perjuicio de las acciones civiles, penales o administrativas que pudieran corresponder.
                    </p>
                    <p>
                        El usuario responderá frente a Ruralpop o frente a terceros de cualesquiera daños y perjuicios que pudieran derivarse del incumplimiento de estas obligaciones.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Reglamento de Servicios Digitales</h2>
                    <p>
                        De conformidad con el Reglamento (UE) 2022/2065, relativo a un mercado único de servicios digitales (Digital Services Act o DSA), las plataformas en línea deben publicar determinada información cuando les resulte aplicable, incluyendo en su caso datos sobre el promedio mensual de destinatarios activos del servicio en la Unión Europea.
                    </p>
                    <p>
                        En la fecha de la última actualización del presente Aviso Legal, Ruralpop no publica en este apartado ninguna cifra específica de promedio mensual de destinatarios activos en la Unión Europea.
                    </p>
                    <p>
                        Ruralpop podrá actualizar esta sección cuando resulte necesario o legalmente exigible conforme a la evolución de la plataforma y a la normativa aplicable.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Canal de contacto y comunicaciones</h2>
                    <p>
                        Para cualquier consulta relacionada con el sitio web, la aplicación, este Aviso Legal o cualquier cuestión jurídica relacionada con Ruralpop, puedes ponerte en contacto a través de los siguientes correos electrónicos:
                    </p>
                    <ul className="list-none space-y-1">
                        <li>
                            <strong>Contacto general:</strong>{" "}
                            <Link href="/contact" className="text-[var(--ag-sys-color-primary)] hover:underline">
                                a través de nuestro formulario de contacto
                            </Link>
                        </li>
                        <li><strong>Protección de datos:</strong> privacidad@ruralpop.com</li>
                    </ul>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">Legislación aplicable y jurisdicción</h2>
                    <p>
                        El presente Aviso Legal se rige por la legislación española.
                    </p>
                    <p>
                        Salvo que la normativa aplicable disponga otra cosa, para la resolución de cuantas controversias o cuestiones pudieran surgir en relación con la interpretación, aplicación y cumplimiento del presente Aviso Legal, las partes se someten a los juzgados y tribunales que resulten competentes conforme a Derecho.
                    </p>

                    <p className="text-sm mt-8 text-[var(--ag-sys-color-text-muted)] italic text-right border-t border-[var(--ag-sys-color-border)] pt-4">
                        Última actualización: 6 de marzo de 2026
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Página de Aviso Legal renderizada estáticamente con Next.js.
 * - Estructura HTML idéntica a `/privacy/page.tsx`, usando encabezados H2, listas nativas, `<hr className="..." />` como separadores (así emulamos el "---" de Markdown pero elegante en CSS).
 * - Se agregó SEO metatags.
 */
