"use server";

import { Resend } from "resend";

export async function sendTemplateEmail(
    recipients: string[],
    subject: string,
    htmlContent: string
) {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY no está configurada." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: "Ruralpop <no-reply@ruralpop.com>",
            to: recipients,
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (e: any) {
        console.error("Failed to send email:", e);
        return { success: false, error: e.message || "Error inesperado al enviar correo." };
    }
}
