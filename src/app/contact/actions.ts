"use server";

import { Resend } from "resend";
import { headers } from "next/headers";

/**
 * Palabras clave que identifican inequívocamente consultas sobre el sector
 * ganadero, agrícola, maquinaria pesada o normativas de animales de compañía de Ruralpop.
 */
const RURALPOP_EXCLUSIVE_KEYWORDS = [
    "núcleo zoológico",
    "nucleo zoologico",
    "bienestar animal",
    "ley 7/2023",
    "cachorro",
    "cachorros",
    "perro",
    "perros",
    "perra",
    "gato",
    "gatos",
    "vaca",
    "vacas",
    "ternero",
    "terneros",
    "bovino",
    "bovinos",
    "oveja",
    "ovejas",
    "cordero",
    "corderos",
    "ovino",
    "cabra",
    "cabras",
    "cabrito",
    "caprino",
    "cerdo",
    "cerdos",
    "porcino",
    "tractor",
    "tractores",
    "cosechadora",
    "apero",
    "aperos",
    "forraje",
    "alfalfa",
    "paja",
    "chihuahua",
    "criador",
    "criadero",
    "rega",
    "explotación ganadera",
    "explotacion ganadera"
];

export async function submitContact(formData: FormData) {
    const name = (formData.get("name") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || "";
    const subject = (formData.get("subject") as string | null)?.trim() || "";
    const message = (formData.get("message") as string | null)?.trim() || "";
    const formIsEquipop = formData.get("isEquipop") === "true";

    if (!name || !email || !message) {
        return { success: false, error: "El nombre, email y mensaje son obligatorios" };
    }

    try {
        const headerList = await headers();
        const host = headerList.get("host") || headerList.get("x-forwarded-host") || "";

        // 1. Detección prioritaria del tenant a través del host real del servidor
        let isEquipop = host.includes("equipop") || (formIsEquipop && !host.includes("ruralpop"));

        // 2. Filtro inteligente de contenido (Smart Keyword Fallback):
        // Si el contenido menciona términos exclusivos del sector ganadero / bienestar animal,
        // se enruta automáticamente a Ruralpop sin importar desde qué formulario o despiste se originó.
        const combinedText = `${subject} ${message}`.toLowerCase();
        const hasRuralpopKeywords = RURALPOP_EXCLUSIVE_KEYWORDS.some(keyword => combinedText.includes(keyword));

        let redirectedNotice = "";
        if (isEquipop && hasRuralpopKeywords) {
            isEquipop = false;
            redirectedNotice = `
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; color: #92400e; font-size: 14px; line-height: 1.5;">
                    <strong>Aviso del Sistema Multi-Tenant:</strong><br/>
                    Este mensaje se inició en la web de <em>Equipop</em>, pero ha sido re-enrutado automáticamente a <strong>Ruralpop</strong> al detectarse consultas sobre ganadería, núcleo zoológico o bienestar animal.
                </div>
            `;
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            console.error("Resend API key missing");
            return { success: false, error: "Servicio de correo no configurado (Falta RESEND_API_KEY)" };
        }

        const resend = new Resend(resendApiKey);

        const emailHtml = `
            <h2>Nuevo Mensaje de Contacto (Web)</h2>
            ${redirectedNotice}
            <p><strong>De:</strong> ${name} (${email})</p>
            <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
            <p><strong>Plataforma asignada:</strong> ${isEquipop ? 'Equipop (Material Hípico)' : 'Ruralpop (Ganadería y Maquinaria)'}</p>
            <p><strong>Host del servidor:</strong> ${host || 'No detectado'}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.5;">${message}</p>
        `;

        const targetEmail = isEquipop ? "equipoprider@gmail.com" : "ruralpopapp@gmail.com";
        const senderLabel = isEquipop ? "Contactos Equipop <contacto@ruralpop.com>" : "Contactos Ruralpop <contacto@ruralpop.com>";
        const subjectPrefix = isEquipop ? "[EQUIPOP]" : "[RURALPOP]";

        const { error } = await resend.emails.send({
            from: senderLabel,
            to: targetEmail,
            subject: `${subjectPrefix} Contacto Web: ${subject || name}`,
            html: emailHtml,
            replyTo: email,
        });

        if (error) {
            console.error("Resend API error detail:", error);
            return { success: false, error: `Error de envío: ${error.message}` };
        }

        return { success: true, message: "¡Mensaje enviado correctamente! Nos pondremos en contacto contigo lo antes posible." };
    } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : "Error desconocido";
        console.error("Action submitContact try/catch error:", errorMsg);
        return { success: false, error: `Excepción del servidor: ${errorMsg}` };
    }
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Detección en Servidor: Anteriormente se confiaba ciegamente en `formData.get("isEquipop")`,
 *      lo que provocaba que usuarios de Ruralpop que aterrizaban en un formulario con `isEquipop="true"`
 *      enviaran correos a Equipop. Ahora se inspecciona `headers().get('host')`.
 *    - Enrutado Inteligente por Palabras Clave: Términos como "núcleo zoológico", "perros", "cachorros",
 *      "ganado", etc., son forzados a `ruralpopapp@gmail.com` incluso si provienen del dominio de Equipop.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Reenvío accidental desde Equipop: Se añade aviso HTML para que el equipo receptor entienda la procedencia.
 *    - Manejo seguro de errores sin tipo 'any' para máxima estabilidad en compilación.
 * -----------------------------------------------------------------------------
 */
