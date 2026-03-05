"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    let redirectPath = "/login?message=Cuenta creada correctamente.";

    if (!email || !password || !name) {
        redirectPath = "/register?error=Todos los campos son obligatorios";
    }

    if (password !== passwordConfirm && redirectPath === "/login?message=Cuenta creada correctamente.") {
        redirectPath = "/register?error=Las contraseñas no coinciden, por favor verifica.";
    }

    if (redirectPath !== "/login?message=Cuenta creada correctamente.") {
        redirect(redirectPath);
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            },
        }
    });

    if (error) {
        console.error("Signup error:", error);
        let errorMsg = error.message;

        if (error.message.includes("User already registered") || error.code === "user_already_exists") {
            errorMsg = "user_exists";
        }

        redirectPath = `/register?error=${encodeURIComponent(errorMsg)}`;
    } else {
        // If no error on signup, try to send welcome email
        try {
            if (process.env.RESEND_API_KEY) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const siteUrl = "https://www.ruralpop.com";

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
                    .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="https://www.ruralpop.com/ruralpop-logo.png" alt="Ruralpop" class="logo" />
                    <h1 class="title">¡Hola, ${name}!</h1>
                    <p class="text">
                        Te damos la bienvenida a <strong>Ruralpop</strong>.<br/><br/>
                        Estamos encantados de tenerte con nosotros en el gran mercado ganadero y agrícola que es Ruralpop. Empieza a vender y comprar ya! Descubre los mejores anuncios, gestiona tus favoritos y conecta con miles de usuarios al instante.
                    </p>
                    <a href="${siteUrl}/account" class="button" style="color: #ffffff; text-decoration: none;">Entrar a Ruralpop</a>
                    <p class="footer">
                        Estás recibiendo este correo porque acabas de crear una cuenta en Ruralpop.<br/><br/>
                        © ${new Date().getFullYear()} Ruralpop
                    </p>
                </div>
            </body>
            </html>
            `;

                const { error: resendError } = await resend.emails.send({
                    from: "Ruralpop <no-reply@ruralpop.com>",
                    to: [email],
                    subject: "¡Bienvenido/a a Ruralpop!",
                    html: emailHtml,
                });

                if (resendError) {
                    console.error("Welcome email resend error:", resendError);
                }
            }
        } catch (e: any) {
            console.error("Unexpected error sending welcome email:", e);
        }

        try {
            revalidatePath("/", "layout");
        } catch (e) {
            console.error("revalidatePath error:", e);
        }

        redirectPath = `/login?message=${encodeURIComponent("Cuenta creada correctamente. ¡Bienvenido/a a Ruralpop!")}`;
    }

    redirect(redirectPath);
}
