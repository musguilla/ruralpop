"use server";

import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        redirect("/forgot-password?error=El correo electrónico es obligatorio");
    }

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

        const { data, error } = await adminSupabase.auth.admin.generateLink({
            type: "recovery",
            email: email,
        });

        if (error) {
            console.error("Generate link error:", error);
            // Don't leak whether the email exists or not for security reasons.
            redirect("/forgot-password?message=Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.");
        }

        const actionLink = data?.properties?.action_link;

        if (actionLink) {
            const resend = new Resend(process.env.RESEND_API_KEY!);

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
                    .button { display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; }
                    .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="https://www.ruralpop.com/ruralpop-logo.png" alt="Ruralpop" class="logo" />
                    <h1 class="title">Recupera tu contraseña</h1>
                    <p class="text">
                        Hemos recibido una solicitud para cambiar tu contraseña en <strong>Ruralpop</strong>. <br/><br/>
                        Haz clic en el siguiente botón para establecer una nueva contraseña de forma segura.
                    </p>
                    <a href="${actionLink}" class="button">Restablecer mi contraseña</a>
                    <p class="footer">
                        Si no has solicitado este cambio, por favor ignora este correo electrónico.<br/><br/>
                        © ${new Date().getFullYear()} Ruralpop. El gran mercado agrícola.
                    </p>
                </div>
            </body>
            </html>
            `;

            const { error: resendError } = await resend.emails.send({
                from: "Ruralpop <no-reply@ruralpop.com>",
                to: [email],
                subject: "Recupera tu contraseña en Ruralpop",
                html: emailHtml,
            });

            if (resendError) {
                console.error("Resend send error:", resendError);
                // Redirect back but log internal error
            }
        }

    } catch (e) {
        console.error("Unexpected error in forgotPassword action:", e);
    }

    // Always return a success message regardless of existence to prevent email enumeration
    redirect("/forgot-password?message=Si el correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña en unos minutos.");
}
