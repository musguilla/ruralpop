"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
    const supabaseAdmin = getAdminClient();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;
    const redirectTo = (formData.get("redirectTo") as string | null) || null;
    const formLocale = (formData.get("locale") as string | null) || null;

    const headersList = await headers();
    const headerLocale = headersList.get("x-locale");
    const isPt = formLocale === "pt" || headerLocale === "pt";

    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    const tenantConfig = getTenantConfig(tenant || 'ruralpop');
    const activeTenantId = tenantConfig.id || getRuralpopDatabaseId() || undefined;
    const tenantName = isEquipop ? "Equipop" : "Ruralpop";

    const registerBase = isPt ? "/pt/register" : "/register";
    const loginBase = isPt ? "/pt/login" : "/login";

    if (!email || !password || !name) {
        const errorMsg = isPt ? "Todos os campos são obrigatórios" : "Todos los campos son obligatorios";
        redirect(`${registerBase}?error=${encodeURIComponent(errorMsg)}`);
    }

    const cleanName = name.trim().toLowerCase();
    const isGenericName = /^(sin\s*nombre|an[oó]nimo|usuario|user|desconocido|null|undefined|admin|administrador|root)$/i.test(cleanName);

    if (cleanName.length < 2 || isGenericName) {
        const errorMsg = isPt ? "Por favor, introduza um nome ou apelido válido." : "Por favor, introduce un nombre o alias válido.";
        redirect(`${registerBase}?error=${encodeURIComponent(errorMsg)}`);
    }

    if (password !== passwordConfirm) {
        const errorMsg = isPt ? "As palavras-passe não coincidem, por favor verifique." : "Las contraseñas no coinciden, por favor verifica.";
        redirect(`${registerBase}?error=${encodeURIComponent(errorMsg)}`);
    }

    // 1. Create the user unconfirmed with explicit locale and country metadata
    const { data: userResp, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
            name: name,
            tenant_id: activeTenantId,
            locale: isPt ? 'pt' : 'es',
            country: isPt ? 'PT' : 'ES'
        }
    });

    if (error) {
        console.error("Signup error:", error);
        let errorMsg = error.message;

        if (error.message.includes("User already registered") || error.code === "user_already_exists") {
            errorMsg = "user_exists";
        }

        const returnUrl = redirectTo
            ? `${registerBase}?redirectTo=${encodeURIComponent(redirectTo)}&error=${encodeURIComponent(errorMsg)}`
            : `${registerBase}?error=${encodeURIComponent(errorMsg)}`;
        redirect(returnUrl);
    }

    // Update public.users record country if created
    if (userResp?.user?.id && isPt) {
        await supabaseAdmin
            .from("users")
            .update({ company_country: "PT" })
            .eq("id", userResp.user.id);
    }

    // 2. Generate the verification link manually pointing to the correct locale
    const siteUrl = isEquipop ? "https://www.equipop.app" : "https://www.ruralpop.com";
    const verificationRedirect = isPt
        ? `${siteUrl}/pt/login?verified=true`
        : `${siteUrl}/login?verified=true`;

    const { data: linkResp, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: {
            redirectTo: verificationRedirect
        }
    });

    // 3. Send the custom verification email via Resend in the correct language
    try {
        if (process.env.RESEND_API_KEY && linkResp?.properties?.action_link) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const logoUrl = isEquipop ? "https://www.equipop.app/equipop-logo.png" : "https://www.ruralpop.com/ruralpop-logo.png";
            const validationLink = linkResp.properties.action_link;
            const fromEmail = isEquipop ? "Equipop <no-reply@equipop.app>" : "Ruralpop <no-reply@ruralpop.com>";

            const subject = isPt ? `Verifique a sua conta da ${tenantName}` : `Verifica tu cuenta de ${tenantName}`;
            const greeting = isPt ? `Olá, ${name}!` : `¡Hola, ${name}!`;
            const welcomeText = isPt
                ? `Damos-lhe as boas-vindas à <strong>${tenantName}</strong>.<br/><br/>Para começar a usar a sua conta e conectar-se com milhares de utilizadores, por favor verifique o seu endereço de email clicando no seguinte botão:`
                : `Te damos la bienvenida a <strong>${tenantName}</strong>.<br/><br/>Para empezar a usar tu cuenta y conectar con miles de usuarios, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:`;
            const buttonText = isPt ? "Validar Conta" : "Validar Cuenta";
            const fallbackIntro = isPt
                ? "Não consegue ver ou clicar no botão? Copie e cole este endereço no seu navegador:"
                : "¿No puedes ver o pulsar el botón? Copia y pega esta dirección en tu navegador:";
            const footerText = isPt
                ? `Está a receber este email porque acabou de criar uma conta na ${tenantName}. Se não foi você, ignore este email.<br/><br/>© ${new Date().getFullYear()} ${tenantName}`
                : `Estás recibiendo este correo porque acabas de crear una cuenta en ${tenantName}. Si no has sido tú, ignora este correo.<br/><br/>© ${new Date().getFullYear()} ${tenantName}`;

            const emailHtml = `
            <!DOCTYPE html>
            <html lang="${isPt ? 'pt' : 'es'}">
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
                    <h1 class="title">${greeting}</h1>
                    <p class="text">${welcomeText}</p>
                    <a href="${validationLink}" class="button" style="color: #ffffff; text-decoration: none;">${buttonText}</a>
                    
                    <p class="fallback">
                        ${fallbackIntro}<br/>
                        <a href="${validationLink}" style="color: #10b981;">${validationLink}</a>
                    </p>

                    <p class="footer">${footerText}</p>
                </div>
            </body>
            </html>
            `;

            const { error: resendError } = await resend.emails.send({
                from: fromEmail,
                to: [email],
                subject,
                html: emailHtml,
            });

            if (resendError) {
                console.error("Validation email resend error:", resendError);
            }
        } else {
            console.error("Could not generate link or missing RESEND_API_KEY", linkErr);
        }
    } catch (e: unknown) {
        console.error("Unexpected error sending validation email:", e);
    }

    const successMessage = isPt
        ? "Deve validar o seu email antes de aceder. Verifique a sua caixa de entrada ou pasta de spam e clique no link que lhe enviámos."
        : "Debes validar tu correo electrónico antes de poder acceder. Revisa tu bandeja de entrada o carpeta de spam y pincha en el enlace que te hemos enviado.";

    const finalRedirectPath = redirectTo
        ? `${loginBase}?redirectTo=${encodeURIComponent(redirectTo)}&message=${encodeURIComponent(successMessage)}`
        : `${loginBase}?message=${encodeURIComponent(successMessage)}`;

    try {
        revalidatePath("/", "layout");
        revalidatePath("/pt", "layout");
    } catch (e) {
        console.error("revalidatePath error:", e);
    }

    redirect(finalRedirectPath);
}

/**
 * -----------------------------------------------------------------------------
 * DOCUMENTACIÓN DE MEMORIA / TECHNICAL DECISION RECORD
 * -----------------------------------------------------------------------------
 * 1. ¿Por qué se tomó esta decisión técnica?
 *    - Persistencia de País y Locale en Registro: Cuando el usuario se registra desde
 *      '/pt/register', se guardan explícitamente 'locale: pt' y 'country: PT' en
 *      `auth.users.raw_user_meta_data` y `public.users.company_country`.
 *    - Notificaciones y Enlaces en Portugués: El email enviado vía Resend se genera
 *      en portugués con un link de verificación que redirige a `/pt/login?verified=true`.
 *    - Preservación de 'redirectTo': Si el usuario venía de `/pt/upload`, el mensaje
 *      de validación y el login de retorno conservan `/pt/upload`.
 * 
 * 2. Posibles "edge cases" cubiertos:
 *    - Reemplazo de tipado 'any' en el bloque catch por 'unknown'.
 *    - Manejo seguro de revalidatePath para ambos layouts ('/' y '/pt').
 * -----------------------------------------------------------------------------
 */
