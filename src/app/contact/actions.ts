"use server";

import { Resend } from "resend";

export async function submitContact(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { success: false, error: "El nombre, email y mensaje son obligatorios" };
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const emailHtml = `
            <h2>Nuevo Mensaje de Contacto (Web)</h2>
            <p><strong>De:</strong> ${name} (${email})</p>
            <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.5;">${message}</p>
        `;

        const { error } = await resend.emails.send({
            from: "Contactos Ruralpop <onboarding@resend.dev>",
            to: "ruralpopapp@gmail.com",
            subject: `Contacto Web: ${subject || name}`,
            html: emailHtml,
            replyTo: email,
        });

        if (error) {
            console.error("Resend API error detail:", error);
            return { success: false, error: `Error de envío: ${error.message}` };
        }

        return { success: true, message: "¡Mensaje enviado correctamente! Nos pondremos en contacto contigo lo antes posible." };
    } catch (e: any) {
        console.error("Action submitContact try/catch error:", e);
        return { success: false, error: `Excepción del servidor: ${e.message || "Error desconocido"}` };
    }
}
