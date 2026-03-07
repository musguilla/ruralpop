"use client";

import React from "react";
import { Cookie } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <Cookie className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Política de Cookies</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Uso de cookies en Ruralpop</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        Esta Política de Cookies explica el uso de cookies y tecnologías similares en el sitio web y, en su caso, en la aplicación móvil de Ruralpop, titularidad de:
                    </p>
                    <ul className="list-none space-y-1">
                        <li><strong>Identidad:</strong> Luis Sánchez Fernández (“Ruralpop”)</li>
                        <li><strong>Domicilio social:</strong> Lugar Navaliega, Asturias</li>
                        <li><strong>NIF:</strong> 09440100A</li>
                        <li><strong>Correo electrónico de contacto Protección de Datos:</strong> privacidad@ruralpop.com</li>
                    </ul>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">1. ¿Qué es una cookie y para qué sirve?</h2>

                    <h3 className="text-xl font-semibold mt-6 mb-3">1.1.</h3>
                    <p>
                        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, teléfono móvil o tablet) cuando visitas un sitio web. Su finalidad principal es reconocer tu navegador, recordar determinada información sobre tu visita y mejorar tu experiencia de navegación.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">1.2.</h3>
                    <p>
                        Asimismo, Ruralpop puede utilizar tecnologías similares a las cookies, como píxeles, etiquetas, identificadores o web beacons, propias o de terceros, que permiten recopilar información sobre la navegación, medir la eficacia de campañas, recordar preferencias o personalizar contenidos y publicidad.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">1.3.</h3>
                    <p>
                        En esta Política utilizamos el término “cookies” para referirnos de forma conjunta a cookies, píxeles, tags, web beacons y otras tecnologías similares.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">2. ¿Qué tipos de cookies existen?</h2>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.1. Según la entidad que las gestione</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Cookies propias:</strong> Son aquellas enviadas a tu dispositivo desde un equipo o dominio gestionado por Ruralpop y desde el que se presta el servicio solicitado.
                        </li>
                        <li>
                            <strong>Cookies de terceros:</strong> Son aquellas enviadas a tu dispositivo desde un equipo o dominio que no es gestionado por Ruralpop, sino por otra entidad colaboradora o proveedora de servicios.
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.2. Según el tiempo que permanecen activas</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Cookies de sesión:</strong> Son cookies temporales que permanecen en el navegador únicamente mientras accedes al sitio web o hasta que cierras el navegador.
                        </li>
                        <li>
                            <strong>Cookies persistentes:</strong> Son cookies que permanecen almacenadas en tu dispositivo durante un período determinado, de modo que pueden ser accedidas y tratadas durante dicho plazo.
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">2.3. Según su finalidad</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Cookies técnicas o estrictamente necesarias:</strong> Son aquellas necesarias para el funcionamiento básico del sitio web o de la aplicación, así como para prestar los servicios solicitados por el usuario. Permiten, por ejemplo, controlar el tráfico, identificar la sesión, acceder a áreas restringidas, recordar elementos de configuración, gestionar procesos de registro o inicio de sesión, utilizar medidas de seguridad, almacenar contenidos o compartir información.
                        </li>
                        <li>
                            <strong>Cookies de preferencias o personalización:</strong> Permiten recordar información para que accedas al servicio con determinadas características que pueden diferenciar tu experiencia de la de otros usuarios, como el idioma, la ubicación aproximada, el número de resultados mostrados o determinadas opciones de visualización.
                        </li>
                        <li>
                            <strong>Cookies analíticas o de medición:</strong> Permiten cuantificar el número de usuarios y realizar la medición y análisis del uso que hacen los usuarios del sitio web o de la aplicación. Esta información se utiliza para introducir mejoras en los servicios y en la experiencia de navegación.
                        </li>
                        <li>
                            <strong>Cookies de publicidad comportamental o marketing:</strong> Almacenan información del comportamiento de los usuarios obtenida a través de la observación continuada de sus hábitos de navegación, lo que permite elaborar un perfil específico para mostrar publicidad personalizada, propia o de terceros, en función de dichos hábitos.
                        </li>
                    </ul>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">3. ¿Qué cookies utiliza Ruralpop?</h2>
                    <p>
                        Ruralpop utiliza cookies propias y de terceros con finalidades técnicas y, en su caso, analíticas. Algunas cookies son estrictamente necesarias para el funcionamiento de la plataforma y no requieren consentimiento. Otras, como las analíticas, solo se instalarán si el usuario las acepta expresamente a través del panel de configuración o banner de cookies.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Cookies técnicas y de sesión (estrictamente necesarias)</h3>
                    <p>
                        Estas cookies son necesarias para que Ruralpop funcione correctamente, para mantener tu sesión iniciada y para permitir funcionalidades esenciales como acceder a tu perfil, publicar anuncios o utilizar el chat interno.
                    </p>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>a) Cookie de autenticación de sesión</strong><br />
                            Nombre: <code>sb-[ref-del-proyecto]-auth-token</code><br />
                            Titularidad: Ruralpop (a través de Supabase)<br />
                            Tipo: Cookie propia / técnica / autenticación<br />
                            Finalidad: Identificar de forma segura tu sesión activa, recordar que has iniciado sesión y permitirte acceder a áreas privadas como tu perfil, la publicación de anuncios o la mensajería entre usuarios.<br />
                            Duración: Persistente, hasta que cierres sesión o caduque el token JWT.
                        </li>
                        <li>
                            <strong>b) Cookie de renovación de sesión</strong><br />
                            Nombre: <code>sb-[ref-del-proyecto]-refresh-token</code> o equivalentes<br />
                            Titularidad: Ruralpop (a través de Supabase)<br />
                            Tipo: Cookie propia / técnica / sesión<br />
                            Finalidad: Permitir mantener la sesión abierta sin que el usuario tenga que introducir su contraseña constantemente al navegar entre páginas o volver a entrar en la plataforma.<br />
                            Duración: Persistente, generalmente hasta 6 meses o el plazo configurado en los ajustes de autenticación del sistema.
                        </li>
                    </ul>
                    <p>
                        Estas cookies son imprescindibles para la prestación del servicio solicitado por el usuario y, por tanto, no pueden desactivarse desde el panel de configuración salvo mediante la propia configuración del navegador, lo que podría impedir el correcto funcionamiento de Ruralpop.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Cookies de análisis y estadísticas</h3>
                    <p>
                        Estas cookies permiten medir el uso del sitio web, diferenciar usuarios, conocer el origen del tráfico y analizar cómo interactúan los visitantes con Ruralpop, con la finalidad de mejorar la plataforma y sus servicios.
                    </p>
                    <p>
                        Estas cookies solo se instalarán si el usuario presta su consentimiento.
                    </p>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>a) Google Analytics</strong><br />
                            Nombre: <code>_ga</code><br />
                            Titularidad: Google Ireland Limited (tercero)<br />
                            Tipo: Cookie de terceros / analítica<br />
                            Finalidad: Distinguir a los usuarios y recopilar información estadística sobre el uso del sitio web.<br />
                            Duración: 2 años
                        </li>
                        <li>
                            <strong>b) Google Analytics 4</strong><br />
                            Nombre: <code>_ga_G-RTTVCPX0XQ</code><br />
                            Titularidad: Google Ireland Limited (tercero)<br />
                            Tipo: Cookie de terceros / analítica<br />
                            Finalidad: Analizar la navegación y entender de dónde procede el tráfico del sitio web, por ejemplo desde búsquedas orgánicas, redes sociales, campañas o accesos directos.<br />
                            Duración: 1 año
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.3. Resumen de cookies utilizadas</h3>
                    <p>A continuación, se resumen las cookies principales utilizadas actualmente por Ruralpop:</p>

                    <div className="overflow-x-auto my-6">
                        <table className="min-w-full text-sm text-left align-middle">
                            <thead className="bg-[var(--ag-sys-color-background)] border-b border-[var(--ag-sys-color-border)]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-[var(--ag-sys-color-text)]">Nombre</th>
                                    <th className="px-4 py-3 font-semibold text-[var(--ag-sys-color-text)]">Titularidad</th>
                                    <th className="px-4 py-3 font-semibold text-[var(--ag-sys-color-text)]">Tipo</th>
                                    <th className="px-4 py-3 font-semibold text-[var(--ag-sys-color-text)]">Finalidad</th>
                                    <th className="px-4 py-3 font-semibold text-[var(--ag-sys-color-text)]">Duración</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--ag-sys-color-border)]">
                                <tr>
                                    <td className="px-4 py-3 font-mono text-xs">sb-[ref]-auth-token</td>
                                    <td className="px-4 py-3">Ruralpop (Supabase)</td>
                                    <td className="px-4 py-3">Propia / Técnica</td>
                                    <td className="px-4 py-3">Mantener sesión e identificar usuario</td>
                                    <td className="px-4 py-3">Persistente (cierre sesión/caducidad)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-mono text-xs">sb-[ref]-refresh-token</td>
                                    <td className="px-4 py-3">Ruralpop (Supabase)</td>
                                    <td className="px-4 py-3">Propia / Técnica</td>
                                    <td className="px-4 py-3">Renovar la sesión automáticamente</td>
                                    <td className="px-4 py-3">Hasta 6 meses</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-mono text-xs">_ga</td>
                                    <td className="px-4 py-3">Google Ireland Ltd</td>
                                    <td className="px-4 py-3">Tercero / Analítica</td>
                                    <td className="px-4 py-3">Distinguir usuarios y generar estadísticas</td>
                                    <td className="px-4 py-3">2 años</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-mono text-xs">_ga_G-RTTVCPX0XQ</td>
                                    <td className="px-4 py-3">Google Ireland Ltd</td>
                                    <td className="px-4 py-3">Tercero / Analítica</td>
                                    <td className="px-4 py-3">Analizar origen de tráfico web</td>
                                    <td className="px-4 py-3">1 año</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm italic">
                        Ruralpop podrá actualizar esta tabla cuando se incorporen nuevas cookies, herramientas de medición o funcionalidades adicionales en la web o en la aplicación.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">4. ¿Cómo puedes configurar o eliminar las cookies?</h2>

                    <h3 className="text-xl font-semibold mt-6 mb-3">4.1.</h3>
                    <p>
                        Puedes configurar el uso de cookies a través del panel o banner de configuración habilitado por Ruralpop al acceder al sitio web. Desde dicho panel podrás aceptar, rechazar o configurar el uso de las cookies no necesarias.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">4.2.</h3>
                    <p>
                        Asimismo, puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo mediante la configuración de las opciones de tu navegador. Ten en cuenta que la desactivación de determinadas cookies puede afectar al funcionamiento del sitio web o limitar algunas funcionalidades.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">4.3.</h3>
                    <p>
                        A continuación, te indicamos de forma orientativa cómo gestionar cookies en los navegadores más habituales:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios</li>
                        <li><strong>Mozilla Firefox:</strong> Ajustes &gt; Privacidad y seguridad &gt; Cookies y datos del sitio</li>
                        <li><strong>Safari:</strong> Ajustes &gt; Safari &gt; Privacidad y seguridad</li>
                        <li><strong>Microsoft Edge:</strong> Configuración &gt; Cookies y permisos del sitio</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">4.4.</h3>
                    <p>
                        En el caso de cookies de terceros, también podrás eliminarlas o deshabilitarlas a través de los sistemas ofrecidos por dichos terceros en sus respectivas políticas de privacidad y cookies.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">4.5.</h3>
                    <p>
                        También puedes obtener más información sobre publicidad basada en intereses y gestión de preferencias en plataformas como Your Online Choices u otras herramientas equivalentes disponibles en Europa.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">5. Cookies de terceros</h2>
                    <p>
                        Ruralpop puede utilizar servicios de terceros que, por cuenta de Ruralpop, recopilen información con fines estadísticos, técnicos, analíticos o de medición del uso del sitio web o de la aplicación.
                    </p>
                    <p>
                        En la actualidad, Ruralpop utiliza servicios de Google Analytics, prestados por Google Ireland Limited, para obtener estadísticas agregadas sobre navegación, tráfico y comportamiento de los usuarios, siempre sujeto al consentimiento previo del usuario cuando sea exigible.
                    </p>
                    <p>
                        Te recomendamos consultar las políticas de privacidad y cookies de dichos terceros para ampliar información sobre el tratamiento de datos que realizan en calidad de responsables independientes.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">6. Base jurídica para el uso de cookies</h2>
                    <p>
                        La base jurídica para el uso de cookies técnicas o estrictamente necesarias es el interés legítimo de Ruralpop en garantizar el funcionamiento correcto, seguro y operativo del sitio web y de la aplicación, así como la correcta prestación del servicio solicitado por el usuario.
                    </p>
                    <p>
                        La base jurídica para el uso de cookies analíticas es el consentimiento del usuario, que podrá otorgarse o retirarse en cualquier momento a través del panel de configuración de cookies o mediante la configuración del navegador.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">7. Información adicional sobre protección de datos</h2>
                    <p>
                        Para consultar el resto de información sobre cómo tratamos tus datos personales, los plazos de conservación, destinatarios o el ejercicio de derechos, puedes acceder a la <a href="/privacy" className="text-[var(--ag-sys-color-primary)] hover:underline">Política de Privacidad de Ruralpop</a>.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">8. Modificaciones de la Política de Cookies</h2>
                    <p>
                        Ruralpop podrá modificar la presente Política de Cookies en cualquier momento para adaptarla a cambios legislativos, técnicos o funcionales, así como para reflejar nuevas cookies o nuevos tratamientos de datos.
                    </p>
                    <p>
                        En caso de cambios relevantes, se informará debidamente al usuario a través del sitio web o de la aplicación.
                    </p>

                    <hr className="my-8 border-[var(--ag-sys-color-border)]" />

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">9. Contacto</h2>
                    <p>
                        Si tienes cualquier duda, consulta o solicitud relacionada con esta Política de Cookies, puedes ponerte en contacto con nosotros a través del siguiente correo electrónico:
                    </p>
                    <p>
                        <strong>privacidad@ruralpop.com</strong>
                    </p>

                    <p className="text-sm mt-8 text-[var(--ag-sys-color-text-muted)] italic text-right border-t border-[var(--ag-sys-color-border)] pt-4">
                        Última actualización: 7 de marzo de 2026
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Se actualiza completamente la Política de Cookies usando el texto legal aportado.
 * - Incluye la estructura de tablas nativas de Tailwind para el diseño responsivo de la lista de cookies.
 */
