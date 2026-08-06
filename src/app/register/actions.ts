"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { getRuralpopDatabaseId, getTenantConfig } from "@/config/tenants";
import { getServerTenantSlug } from "@/utils/tenant/server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function signup(formData: FormData) {
    const supabase = await createClient();
    const supabaseAdmin = getAdminClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;
    
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const tenantConfig = getTenantConfig(tenant || 'ruralpop');
    const activeTenantId = tenantConfig.id || getRuralpopDatabaseId() || undefined;
    const tenantName = isEquipop ? "Equipop" : "Ruralpop";

    let redirectPath = "/login?message=Revisa tu correo electrónico para validar tu cuenta. Te hemos enviado un enlace de verificación.";

    if (!email || !password || !name) {
        redirectPath = "/register?error=Todos los campos son obligatorios";
    }

    if (redirectPath.includes("Revisa tu correo")) {
        const cleanName = name.trim().toLowerCase();
        // Regex to catch variants of generic names, handling accents
        const isGenericName = /^(sin\s*nombre|an[oó]nimo|usuario|user|desconocido|null|undefined|admin|administrador|root)$/i.test(cleanName);

        if (cleanName.length < 2 || isGenericName) {
            redirectPath = "/register?error=Por favor, introduce un nombre o alias válido.";
        }
    }

    if (password !== passwordConfirm && redirectPath.includes("Revisa tu correo")) {
        redirectPath = "/register?error=Las contraseñas no coinciden, por favor verifica.";
    }

    if (!redirectPath.includes("Revisa tu correo")) {
        redirect(redirectPath);
    }

    // 1. Create the user unconfirmed (avoids auto-confirming if Supabase's toggle is off)
    const { data: userResp, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
            name: name,
            tenant_id: activeTenantId,
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
        // 2. Generate the verification link manually
        const siteUrl = isEquipop ? "https://www.equipop.app" : "https://www.ruralpop.com";
        const { data: linkResp, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                redirectTo: `${siteUrl}/login?verified=true`
            }
        });

        // 3. Send the custom verification email via Resend
        try {
            if (process.env.RESEND_API_KEY && linkResp?.properties?.action_link) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const logoUrl = isEquipop ? "https://www.equipop.app/equipop-logo.png" : "https://www.ruralpop.com/ruralpop-logo.png";
                const validationLink = linkResp.properties.action_link;
                const fromEmail = isEquipop ? "Equipop <no-reply@equipop.app>" : "Ruralpop <no-reply@ruralpop.com>";

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
                    .fallback { margin-top: 24px; font-size: 14px; color: #6b7280; word-break: break-all; }
                    .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${logoUrl}" alt="${tenantName}" class="logo" />
                    <h1 class="title">¡Hola, ${name}!</h1>
                    <p class="text">
                        Te damos la bienvenida a <strong>${tenantName}</strong>.<br/><br/>
                        Para empezar a usar tu cuenta y conectar con miles de usuarios, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:
                    </p>
                    <a href="${validationLink}" class="button" style="color: #ffffff; text-decoration: none;">Validar Cuenta</a>
                    
                    <p class="fallback">
                        ¿No puedes ver o pulsar el botón? Copia y pega esta dirección en tu navegador:<br/>
                        <a href="${validationLink}" style="color: #10b981;">${validationLink}</a>
                    </p>

                    <p class="footer">
                        Estás recibiendo este correo porque acabas de crear una cuenta en ${tenantName}. Si no has sido tú, ignora este correo.<br/><br/>
                        © ${new Date().getFullYear()} ${tenantName}
                    </p>
                </div>
            </body>
            </html>
            `;

                const { error: resendError } = await resend.emails.send({
                    from: fromEmail,
                    to: [email],
                    subject: `Verifica tu cuenta de ${tenantName}`,
                    html: emailHtml,
                });

                if (resendError) {
                    console.error("Validation email resend error:", resendError);
                }
            } else {
                console.error("Could not generate link or missing RESEND_API_KEY", linkErr);
            }
        } catch (e: any) {
            console.error("Unexpected error sending validation email:", e);
        }

        redirectPath = `/login?message=${encodeURIComponent(`Debes validar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada o carpeta de spam y pincha en el enlace que te hemos enviado.`)}`;
    }

    try {
        revalidatePath("/", "layout");
    } catch (e) {
        console.error("revalidatePath error:", e);
    }

    redirect(redirectPath);
}
