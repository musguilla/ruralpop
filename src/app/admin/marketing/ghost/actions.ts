"use server";

import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "@/utils/seoUtils";

type InvitePayload = {
    companyId: string;
    commercialName: string;
    token: string;
    emails: string[];
};

export async function sendGhostInvites(payloads: InvitePayload[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado" };
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "No autorizado" };
    }

    if (!process.env.RESEND_API_KEY) {
        return { error: "Resend no está configurado (Falta RESEND_API_KEY)" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = "https://www.ruralpop.com";
    let count = 0;

    for (const invite of payloads) {
        const { commercialName, token, emails } = invite;
        const magicUrl = `${siteUrl}/empresa/${slugify(commercialName)}?token=${token}`;

        const emailHtml = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: center; border: 1px solid #e5e7eb; }
                    .logo { width: 150px; margin-bottom: 24px; }
                    .title { font-size: 26px; font-weight: 800; margin-bottom: 16px; color: #111827; }
                    .text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; text-align: left; }
                    .highlight { font-weight: bold; color: #10b981; }
                    .button { display: inline-block; padding: 16px 32px; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 800; border-radius: 8px; font-size: 18px; margin-top: 10px; margin-bottom: 24px;}
                    .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;}
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${siteUrl}/ruralpop-logo.png" alt="Ruralpop" class="logo" />
                    <h1 class="title">¡Hola, equipo de ${commercialName}! 👋</h1>
                    
                    <p class="text">
                        En <strong>Ruralpop</strong> sabemos que vuestros productos son de primera clase, y por eso nos hemos adelantado: <strong>¡Hemos diseñado vuestro perfil de empresa y subido vuestros productos!</strong>
                    </p>
                    
                    <p class="text">
                        Ruralpop es la nueva plataforma dedicada exclusivamente a profesionales del sector agrónomo, ganadería y rural. Queremos ayudaros a tener <span class="highlight">visibilidad nacional</span> inmediata y conectaros directamente con miles de usuarios interesados.
                    </p>

                    <p class="text">
                        Para ver cómo ha quedado vuestro nuevo escaparate digital y empezar a recibir clientes, <strong>haced clic en el siguiente enlace exclusivo</strong> (este es un enlace mágico seguro y único para vosotros):
                    </p>

                    <a href="${magicUrl}" class="button" style="color:#ffffff; text-decoration:none;">Ver Escaparate de ${commercialName}</a>
                    
                    <p class="text" style="font-size: 14px;">
                        Si tenéis alguna duda, podéis responder directamente a este correo.<br/>
                        ¡Estamos deseando veros crecer con nosotros!
                    </p>

                    <p class="footer">
                        © ${new Date().getFullYear()} Ruralpop<br>
                        El punto de encuentro rural.
                    </p>
                </div>
            </body>
            </html>
        `;

        for (const email of emails) {
            try {
                const { error } = await resend.emails.send({
                    from: "Equipo Ruralpop <onboarding@ruralpop.com>",
                    to: [email],
                    subject: `Vuestro nuevo escaparate digital en Ruralpop (${commercialName})`,
                    html: emailHtml,
                });

                if (error) {
                    console.error(`Resend API error sending to ${email}:`, error);
                } else {
                    count++;
                }
            } catch (err) {
                console.error(`Unexpected error sending to ${email}:`, err);
            }
        }
    }

    return { success: true, count };
}

export async function saveCompanyEmails(companyId: string, emails: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado" };
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "No autorizado" };
    }

    const { error } = await supabase
        .from('users')
        .update({ email: emails })
        .eq('id', companyId);

    if (error) {
        console.error("Error saving ghost emails:", error);
        return { error: error.message };
    }

    return { success: true };
}
