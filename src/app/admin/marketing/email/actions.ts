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
        if (recipients.length === 1) {
            const { data, error } = await resend.emails.send({
                from: "Ruralpop <no-reply@ruralpop.com>",
                to: recipients[0],
                subject: subject,
                html: htmlContent,
            });

            if (error) {
                console.error("Resend error:", error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        }

        // Multiple recipients: send in batches of 100 to ensure privacy (recipients never see each other)
        const chunkSize = 100;
        let sentCount = 0;

        for (let i = 0; i < recipients.length; i += chunkSize) {
            const chunk = recipients.slice(i, i + chunkSize);
            const batchPayload = chunk.map(email => ({
                from: "Ruralpop <no-reply@ruralpop.com>",
                to: email,
                subject: subject,
                html: htmlContent,
            }));

            const { error } = await resend.batch.send(batchPayload);
            if (error) {
                console.error("Resend batch error:", error);
                return { success: false, error: `Error tras enviar ${sentCount} correos: ${error.message}` };
            }

            sentCount += chunk.length;
        }

        return { success: true, count: sentCount };
    } catch (e: any) {
        console.error("Failed to send email:", e);
        return { success: false, error: e.message || "Error inesperado al enviar correo." };
    }
}
