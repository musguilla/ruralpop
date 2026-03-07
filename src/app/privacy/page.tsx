"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-[var(--ag-sys-color-background)] min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-[var(--ag-sys-color-surface)] border border-[var(--ag-sys-color-border)] rounded-[2rem] p-8 sm:p-12 shadow-sm">
                <header className="mb-8 border-b border-[var(--ag-sys-color-border)] pb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--ag-sys-color-primary)]/10 text-[var(--ag-sys-color-primary)] rounded-full flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--ag-sys-color-text)] tracking-tight">Política de Privacidad</h1>
                        <p className="text-[var(--ag-sys-color-text-muted)] mt-1 font-medium">Información adicional sobre Protección de Datos</p>
                    </div>
                </header>

                <div className="prose prose-sm sm:prose-base max-w-none text-[var(--ag-sys-color-text)] leading-relaxed space-y-6">
                    <p>
                        La presente Política de Privacidad describe cómo se recogen, utilizan, almacenan,
                        comparten y protegen los datos personales que nos facilites como usuario al utilizar los
                        servicios de Ruralpop, así como a través de las áreas públicas y privadas, según
                        corresponda, del sitio web y de la aplicación móvil de Ruralpop.
                    </p>
                    <p>
                        Tus datos personales serán tratados de forma eficaz, proporcional y responsable, en
                        estricto cumplimiento de lo establecido en el Reglamento (UE) 2016/679 General de
                        Protección de Datos (“RGPD”), en la Ley Orgánica 3/2018 de Protección de Datos
                        Personales y garantía de los derechos digitales (“LOPDGDD”) y en el resto de la
                        normativa que resulte aplicable.
                    </p>
                    <p>Por tu parte, como usuario, garantizas:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>a) la autenticidad y veracidad de todos los datos que comuniques o facilites a través del sitio web o la aplicación móvil;</li>
                        <li>b) que los datos personales facilitados son tuyos o cuentas con legitimación suficiente para aportarlos; y</li>
                        <li>c) que mantendrás actualizada la información facilitada, de forma que responda en todo momento a tu situación real, siendo responsable de las manifestaciones falsas o inexactas que realices, así como de los perjuicios que pudieran derivarse de ello.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">1. Responsable del tratamiento</h2>
                    <p><strong>¿Quién es el responsable del tratamiento de tus datos?</strong></p>
                    <ul className="list-none space-y-1">
                        <li><strong>Identidad:</strong> Luis Sánchez Fernández (“Ruralpop”)</li>
                        <li><strong>Domicilio social:</strong> Lugar Navaliega, Asturias</li>
                        <li><strong>NIF:</strong> 09440100A</li>
                        <li><strong>Contacto:</strong> Puedes contactar con nosotros a través de los canales habilitados en la plataforma.</li>
                        <li><strong>Correo electrónico de contacto Protección de Datos:</strong> privacidad@ruralpop.com</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">2. Tipología de datos tratados</h2>
                    <p><strong>¿Qué información personal tratamos?</strong></p>
                    <p>Ruralpop podrá tratar, según el uso que hagas de la plataforma, las siguientes categorías de datos personales:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Nombre y apellidos</li>
                        <li>Dirección de correo electrónico</li>
                        <li>Número de teléfono</li>
                        <li>Nombre de usuario y contraseña</li>
                        <li>Fotografía de perfil, en su caso</li>
                        <li>Dirección, localidad, provincia y código postal, cuando resulte necesario</li>
                        <li>Datos de facturación, en caso de contratar servicios de pago</li>
                        <li>Datos de navegación y uso de la plataforma</li>
                        <li>Datos de geolocalización, si los activas o autorizas</li>
                        <li>Información relativa a los anuncios publicados, productos, animales, maquinaria, servicios o contenidos que publiques en Ruralpop</li>
                        <li>Comunicaciones mantenidas con otros usuarios o con Ruralpop a través de formularios, mensajería o soporte</li>
                        <li>Cualquier otro dato que nos facilites voluntariamente</li>
                    </ul>
                    <p>
                        Todos los campos que aparezcan señalados con un asterisco (*) en los formularios serán obligatorios. La falta de cumplimentación de dichos campos podrá impedir la prestación del servicio o la atención de la solicitud correspondiente.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">3. Finalidades del tratamiento y bases de legitimación</h2>
                    <p><strong>¿Cómo tratamos tus datos personales y qué nos permite hacerlo?</strong></p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Registro en la plataforma y prestación de servicios</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Alta y gestión de la cuenta de usuario:</strong> Tratamos tus datos para darte de alta como usuario en Ruralpop, permitirte acceder a tu cuenta, gestionar tu perfil y prestarte los servicios disponibles en la plataforma.
                            <br /><em>Base legitimadora: ejecución de un contrato.</em>
                        </li>
                        <li>
                            <strong>Configuración de perfil y preferencias:</strong> Tratamos los datos que incluyas en tu perfil y preferencias de uso para personalizar tu experiencia en la plataforma.
                            <br /><em>Base legitimadora: ejecución del contrato y, cuando proceda, tu consentimiento.</em>
                        </li>
                        <li>
                            <strong>Publicación y gestión de anuncios:</strong> Tratamos tus datos para permitir la publicación, edición, gestión y visibilidad de anuncios en Ruralpop.
                            <br /><em>Base legitimadora: ejecución de un contrato.</em>
                        </li>
                        <li>
                            <strong>Contacto entre usuarios:</strong> A través de la plataforma podrás contactar con otros usuarios, anunciantes o profesionales. En ese caso, se facilitarán al destinatario los datos e información que incluyas en el formulario o sistema de mensajería.
                            <br /><em>Base legitimadora: ejecución de un contrato.</em>
                        </li>
                        <li>
                            <strong>Mensajería interna entre usuarios:</strong> Cuando utilices el formulario de contacto o el sistema de chat o mensajería dentro de Ruralpop, tus mensajes podrán ser tratados para facilitar la comunicación entre usuarios y el correcto funcionamiento del servicio.
                            <br /><em>Base legitimadora: ejecución del contrato.</em>
                        </li>
                        <li>
                            <strong>Moderación, revisión y prevención de usos indebidos:</strong> Los anuncios, mensajes y contenidos publicados podrán ser revisados mediante procesos manuales y/o automatizados para prevenir fraude, spam, estafas, actividades ilícitas, conductas abusivas, contenido inapropiado o incumplimientos de las condiciones de uso.
                            <br /><em>Base legitimadora: interés legítimo en mantener la seguridad, legalidad y buen funcionamiento de la plataforma.</em>
                            <br />En los casos en los que se adopten decisiones apoyadas en procesos automatizados, el usuario podrá solicitar intervención humana, expresar su punto de vista e impugnar la decisión cuando proceda conforme a la normativa aplicable.
                        </li>
                        <li>
                            <strong>Alertas y avisos relacionados con búsquedas o anuncios:</strong> Si activas determinadas funciones, podremos enviarte alertas relacionadas con búsquedas guardadas, anuncios favoritos, novedades o publicaciones que coincidan con tus preferencias.
                            <br /><em>Base legitimadora: consentimiento.</em>
                        </li>
                        <li>
                            <strong>Notificaciones de servicio:</strong> Podremos enviarte comunicaciones necesarias para la prestación del servicio, como avisos técnicos, alertas de seguridad, cambios relevantes, recordatorios, incidencias o comunicaciones sobre tu cuenta y tus anuncios.
                            <br /><em>Base legitimadora: ejecución del contrato y, cuando proceda, cumplimiento de obligaciones legales.</em>
                        </li>
                        <li>
                            <strong>Atención al usuario y soporte:</strong> Tratamos tus datos para responder a consultas, incidencias, reclamaciones o solicitudes remitidas a través del formulario de contacto, email o cualquier canal habilitado.
                            <br /><em>Base legitimadora: ejecución del contrato o aplicación de medidas precontractuales a petición del interesado.</em>
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Fines analíticos y estadísticos</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Análisis de uso y mejora de la plataforma:</strong> Tratamos datos de navegación, uso, interacción y comportamiento dentro de Ruralpop para analizar el funcionamiento de la plataforma, mejorar la experiencia de usuario, detectar errores y optimizar servicios y contenidos.
                            <br /><em>Base legitimadora: interés legítimo y, cuando sea exigible, consentimiento conforme a la política de cookies.</em>
                        </li>
                        <li>
                            <strong>Elaboración de estadísticas agregadas:</strong> Podremos elaborar informes estadísticos internos, agregados o anonimizados sobre el uso de Ruralpop, categorías más consultadas, volumen de publicaciones, interacción con contenidos y otras métricas de actividad.
                            <br /><em>Base legitimadora: interés legítimo.</em>
                        </li>
                        <li>
                            <strong>Cumplimiento de obligaciones de transparencia o reporte:</strong> En caso de que la normativa aplicable exija la elaboración de informes o estadísticas sobre el funcionamiento de la plataforma, trataremos los datos necesarios para ello.
                            <br /><em>Base legitimadora: cumplimiento de obligación legal.</em>
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.3. Actividades comerciales y marketing</h3>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Envío de comunicaciones comerciales propias:</strong> Podremos enviarte información sobre novedades, mejoras, productos, servicios, promociones o funcionalidades de Ruralpop por medios electrónicos cuando exista una relación previa y la normativa lo permita, o cuando nos hayas dado tu consentimiento.
                            <br /><em>Base legitimadora: interés legítimo, cuando exista relación previa y se trate de comunicaciones sobre servicios similares, o consentimiento en los demás casos.</em>
                        </li>
                        <li>
                            <strong>Publicidad personalizada y recomendaciones:</strong> En caso de que lo autorices, podremos personalizar contenidos, recomendaciones o comunicaciones comerciales en función de tus intereses, búsquedas, actividad o uso de la plataforma.
                            <br /><em>Base legitimadora: consentimiento.</em>
                        </li>
                        <li>
                            <strong>Encuestas de satisfacción y estudios de calidad:</strong> Podremos enviarte encuestas para conocer tu opinión sobre Ruralpop, sus funcionalidades y la experiencia de usuario, con el fin de mejorar nuestros servicios.
                            <br /><em>Base legitimadora: interés legítimo.</em>
                        </li>
                        <li>
                            <strong>Participación en promociones, sorteos o concursos:</strong> Si participas en promociones, sorteos o concursos organizados por Ruralpop, trataremos tus datos para gestionar tu participación y, en su caso, la entrega de premios, conforme a las bases legales aplicables.
                            <br /><em>Base legitimadora: ejecución de la relación jurídica derivada de tu participación y, cuando proceda, consentimiento.</em>
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.4. Seguridad de la cuenta y de la plataforma</h3>
                    <p>
                        Tratamos tus datos para prevenir abusos, accesos no autorizados, suplantaciones de identidad, actividades fraudulentas, ataques informáticos, spam y cualquier uso ilícito o contrario a las condiciones de uso de Ruralpop.
                        <br /><em>Base legitimadora: interés legítimo.</em>
                    </p>
                    <p>
                        En caso de detectar conductas sospechosas o contrarias a la normativa o a las condiciones de uso, Ruralpop podrá limitar, suspender o cancelar cuentas, anuncios o contenidos.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">3.5. Cumplimiento de obligaciones legales</h3>
                    <p>
                        Tratamos tus datos cuando sea necesario para cumplir obligaciones legales aplicables, atender requerimientos de autoridades competentes, gestionar el ejercicio de derechos de protección de datos o conservar determinada información durante los plazos legalmente exigidos.
                        <br /><em>Base legitimadora: cumplimiento de obligación legal.</em>
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">4. Plazo de conservación</h2>
                    <p><strong>¿Durante cuánto tiempo conservaremos tus datos?</strong></p>
                    <p>Tus datos personales serán conservados:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Mientras mantengas tu cuenta activa en Ruralpop o sigas utilizando nuestros servicios.</li>
                        <li>Mientras sea necesario para la finalidad para la que fueron recabados.</li>
                        <li>Mientras no retires el consentimiento, en aquellos tratamientos basados en el mismo.</li>
                        <li>Durante los plazos legales necesarios para cumplir obligaciones legales, fiscales, contables o para la formulación, ejercicio o defensa de reclamaciones.</li>
                    </ul>
                    <p>
                        Una vez finalizados dichos plazos, los datos podrán mantenerse debidamente bloqueados durante los periodos de prescripción legal y posteriormente serán suprimidos de forma segura.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">5. Enlaces a terceros</h2>
                    <p>
                        Ruralpop puede incluir enlaces a sitios web, servicios, aplicaciones o plataformas de terceros. En estos casos, el uso de dichos servicios se regirá por las políticas de privacidad y condiciones legales de esos terceros, siendo estos los únicos responsables de sus propios tratamientos de datos.
                    </p>
                    <p>
                        Ruralpop no se responsabiliza de los tratamientos de datos realizados por terceros ajenos a su organización.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">6. Origen de los datos y destinatarios</h2>
                    <p><strong>¿De quién obtenemos tus datos?</strong></p>
                    <p>Con carácter general, los datos personales que tratamos nos los facilitas tú directamente al registrarte, publicar anuncios, contactar con otros usuarios, completar formularios o utilizar la plataforma.</p>
                    <p>También podremos obtener datos:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A través del uso que hagas del sitio web o de la app</li>
                        <li>De cookies y tecnologías similares, cuando lo autorices</li>
                        <li>De proveedores tecnológicos o de pago, cuando sea necesario para la prestación del servicio</li>
                        <li>De autoridades públicas o registros, cuando exista obligación legal o habilitación suficiente</li>
                    </ul>

                    <p className="mt-6"><strong>¿A quién comunicamos tus datos?</strong></p>
                    <p>Tus datos podrán ser comunicados a:</p>
                    <ul className="list-none space-y-4">
                        <li>
                            <strong>Otros usuarios de Ruralpop:</strong> Cuando publiques anuncios o contactes con otros usuarios, determinados datos podrán ser visibles o ser comunicados a dichos usuarios en la medida necesaria para facilitar la compraventa, el contacto o la prestación del servicio.
                        </li>
                        <li>
                            <strong>Proveedores de servicios:</strong> Ruralpop podrá apoyarse en terceros proveedores que actúen como encargados del tratamiento para prestar servicios tales como alojamiento web, almacenamiento, email, mensajería, notificaciones, analítica, soporte técnico, pagos, seguridad, prevención del fraude o atención al cliente. Estos proveedores tratarán los datos únicamente siguiendo instrucciones de Ruralpop y bajo contrato.
                        </li>
                        <li>
                            <strong>Proveedores de pago o facturación:</strong> Si Ruralpop ofrece servicios de pago, suscripción, promoción de anuncios o funcionalidades premium, los datos necesarios podrán ser comunicados a proveedores de pago, pasarelas de cobro o entidades financieras para gestionar la operación.
                        </li>
                        <li>
                            <strong>Empresas de transporte o logística:</strong> En caso de que Ruralpop incorpore servicios de envío o logística, los datos estrictamente necesarios podrán comunicarse a empresas de transporte para gestionar entregas o devoluciones.
                        </li>
                        <li>
                            <strong>Administraciones públicas, juzgados, tribunales y fuerzas y cuerpos de seguridad:</strong> Cuando exista obligación legal, requerimiento válido o resulte necesario para la formulación, ejercicio o defensa de reclamaciones.
                        </li>
                        <li>
                            <strong>Transferencias internacionales:</strong> Algunos proveedores tecnológicos pueden estar ubicados fuera del Espacio Económico Europeo. En esos casos, Ruralpop adoptará las garantías adecuadas conforme al RGPD, como cláusulas contractuales tipo aprobadas por la Comisión Europea o mecanismos equivalentes.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">7. Derechos del usuario</h2>
                    <p><strong>¿Cuáles son tus derechos?</strong></p>
                    <p>Tienes derecho a:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Obtener confirmación sobre si estamos tratando tus datos personales</li>
                        <li>Acceder a tus datos personales</li>
                        <li>Solicitar la rectificación de los datos inexactos</li>
                        <li>Solicitar la supresión de tus datos cuando proceda</li>
                        <li>Solicitar la limitación del tratamiento en determinados casos</li>
                        <li>Oponerte al tratamiento de tus datos en determinadas circunstancias</li>
                        <li>Solicitar la portabilidad de tus datos</li>
                        <li>Retirar en cualquier momento el consentimiento prestado, sin que ello afecte a la licitud del tratamiento previo a su retirada</li>
                    </ul>
                    <p className="mt-4">
                        Para ejercer tus derechos, puedes escribir a: <strong>privacidad@ruralpop.com</strong> indicando claramente tu solicitud, nombre y apellidos y el correo electrónico vinculado a tu cuenta.
                    </p>
                    <p>
                        Asimismo, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que el tratamiento de tus datos no se ajusta a la normativa aplicable.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">8. Cookies</h2>
                    <p>
                        Ruralpop utiliza cookies y tecnologías similares en su sitio web y, en su caso, en su aplicación móvil, con fines técnicos, analíticos y, cuando proceda, publicitarios o de personalización.
                        Puedes obtener más información en la correspondiente <a href="/cookies" className="text-[var(--ag-sys-color-primary)] hover:underline">Política de Cookies de Ruralpop</a>.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">9. Confidencialidad y seguridad</h2>
                    <p>
                        Ruralpop tratará tus datos personales de manera confidencial y aplicará las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, evitando su pérdida, alteración, tratamiento no autorizado o acceso indebido. No obstante, el usuario debe ser consciente de que las medidas de seguridad en Internet no son absolutamente invulnerables.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-[var(--ag-sys-color-text)]">10. Modificaciones de la política de privacidad</h2>
                    <p>
                        Ruralpop se reserva el derecho de modificar la presente Política de Privacidad en cualquier momento para adaptarla a cambios legislativos, jurisprudenciales o de funcionamiento de la plataforma. En caso de modificación, la versión actualizada será publicada en el sitio web y/o en la aplicación móvil, indicando la fecha de su última actualización.
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
 * - Se elimina la vista obsoleta ("Aviso legal") y se unifica en una Politica elaborada.
 * - Estructura HTML semántica (h2, h3, ul, li) para mejor SEO y legibilidad en el documento legal.
 */
