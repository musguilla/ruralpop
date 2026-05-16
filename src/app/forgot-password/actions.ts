"use server";

import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getServerTenantSlug } from "@/utils/tenant/server";

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        redirect("/forgot-password?error=El correo electrónico es obligatorio");
    }

    let redirectPath = "/forgot-password?error=No se ha podido generar el enlace de recuperación.";

    try {
        const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const tenant = await getServerTenantSlug();
        const isEquipop = tenant === 'equipop';
        const siteUrl = isEquipop ? "https://www.equipop.net" : "https://www.ruralpop.com";
        const tenantName = isEquipop ? "Equipop" : "Ruralpop";
        const logoUrl = isEquipop ? "https://www.equipop.net/equipop-logo.png" : "https://www.ruralpop.com/ruralpop-logo.png";
        
        const { data, error } = await adminSupabase.auth.admin.generateLink({
            type: "recovery",
            email: email,
            options: {
                redirectTo: `${siteUrl}/update-password`
            }
        });

        if (error) {
            console.error("Generate link error:", error);
            // Don't leak whether the email exists or not for security reasons.
            redirectPath = "/forgot-password?message=Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.";
        } else {
            const actionLink = data?.properties?.action_link;

            if (actionLink) {
                if (!process.env.RESEND_API_KEY) {
                    redirectPath = "/forgot-password?error=Error del servidor: RESEND_API_KEY no configurado.";
                } else {
                    const resend = new Resend(process.env.RESEND_API_KEY);

                    const emailHtml = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: center; border: 1px solid #e5e7eb; }
                        .logo { width: 150px; margin-bottom: 24px; }
                        .title { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827; }
                        .text { font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 32px; }
                        .button { display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; }
                        .fallback-text { margin-top: 24px; font-size: 13px; color: #6b7280; word-break: break-all; text-align: left; background-color: #f3f4f6; padding: 12px; border-radius: 6px; }
                        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <img src="${logoUrl}" alt="${tenantName}" class="logo" />
                        <h1 class="title">Recupera tu contraseña</h1>
                        <p class="text">
                            Hemos recibido una solicitud para cambiar tu contraseña en <strong>${tenantName}</strong>. <br/><br/>
                            Haz clic en el siguiente botón para establecer una nueva contraseña de forma segura.
                        </p>
                        <a href="${actionLink}" class="button" style="color: #ffffff; text-decoration: none;">Restablecer mi contraseña</a>
                        
                        <p class="fallback-text">
                            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br/>
                            <a href="${actionLink}" style="color: #10b981;">${actionLink}</a>
                        </p>
                        <p class="footer">
                            Si no has solicitado este cambio, por favor ignora este correo electrónico.<br/><br/>
                            © ${new Date().getFullYear()} ${tenantName}.
                        </p>
                    </div>
                </body>
                </html>
                \`;

                    const { error: resendError } = await resend.emails.send({
                        from: \`${tenantName} <no-reply@ruralpop.com>\`,
                        to: [email],
                        subject: \`Recupera tu contraseña en ${tenantName}\`,
                        html: emailHtml,
                    });

                    if (resendError) {
                        console.error("Resend send error:", resendError);
                        redirectPath = `/forgot-password?error=Error al enviar email: ${resendError.message}`;
                    } else {
                        redirectPath = "/forgot-password?message=Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña en unos minutos.";
                    }
                }
            } else {
                redirectPath = "/forgot-password?message=Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.";
            }
        }
    } catch (e: any) {
        if (e.message && e.message.includes("NEXT_REDIRECT")) {
            throw e;
        }
        console.error("Unexpected error in forgotPassword action:", e);
        redirectPath = `/forgot-password?error=Error inesperado: ${e.message || "Contacta al soporte"}`;
    }

    redirect(redirectPath);
}
