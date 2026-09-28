import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

interface ForgotPasswordRequestBody {
    email: string;
    tenant?: "ruralpop" | "equipop";
}

interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ForgotPasswordResponse>> {
    try {
        const body = (await request.json()) as ForgotPasswordRequestBody;
        const email = body.email?.trim().toLowerCase();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { success: false, message: "Debes proporcionar un correo electrónico válido." },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
            console.error("Missing Auth/Resend environment variables");
            return NextResponse.json(
                { success: false, message: "Error de configuración en el servidor." },
                { status: 500 }
            );
        }

        const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const isEquipop = body.tenant === "equipop" || request.headers.get("host")?.includes("equipop");
        const siteUrl = isEquipop ? "https://www.equipop.app" : "https://www.ruralpop.com";
        const tenantName = isEquipop ? "Equipop" : "Ruralpop";
        const logoUrl = isEquipop
            ? "https://www.equipop.app/equipop-logo.png"
            : "https://www.ruralpop.com/ruralpop-logo.png";

        const { data, error } = await adminSupabase.auth.admin.generateLink({
            type: "recovery",
            email: email,
            options: {
                redirectTo: `${siteUrl}/update-password`,
            },
        });

        if (error) {
            console.error("Supabase generateLink error:", error.message);
            // Por privacidad y seguridad, no revelamos si el usuario existe o no
            return NextResponse.json({
                success: true,
                message: "Si tu correo está registrado, recibirás un enlace seguro para restablecer tu contraseña.",
            });
        }

        const hashedToken = data?.properties?.hashed_token;
        const actionLink = data?.properties?.action_link;

        // Anti-Scanner Protection: Enviar enlace directo al frontend para evitar que los escáneres
        // de correo (Hotmail Defender / Safelinks) quemen el token de un solo uso en peticiones GET.
        const recoveryLink = hashedToken
            ? `${siteUrl}/update-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
            : actionLink || `${siteUrl}/update-password`;

        const resend = new Resend(resendApiKey);

        const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .logo { width: 150px; margin-bottom: 24px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827; }
        .text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 32px; }
        .button { display: inline-block; padding: 14px 32px; background-color: ${isEquipop ? '#1E3A8A' : '#10b981'}; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; }
        .fallback-text { margin-top: 28px; font-size: 13px; color: #6b7280; word-break: break-all; text-align: left; background-color: #f3f4f6; padding: 14px; border-radius: 8px; }
        .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="${tenantName}" class="logo" />
        <h1 class="title">Recupera tu contraseña</h1>
        <p class="text">
            Hemos recibido una solicitud para cambiar tu contraseña en <strong>${tenantName}</strong>.<br/><br/>
            Haz clic en el siguiente botón para establecer una nueva contraseña de forma segura.
        </p>
        <a href="${recoveryLink}" class="button" style="color: #ffffff; text-decoration: none;">Restablecer mi contraseña</a>
        
        <p class="fallback-text">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador o app:<br/>
            <a href="${recoveryLink}" style="color: ${isEquipop ? '#1E3A8A' : '#10b981'}; font-weight: 500;">${recoveryLink}</a>
        </p>
        <p class="footer">
            Si no has solicitado este cambio, puedes ignorar este correo de forma segura.<br/><br/>
            © ${new Date().getFullYear()} ${tenantName}.
        </p>
    </div>
</body>
</html>
`;

        const { error: resendError } = await resend.emails.send({
            from: `${tenantName} <no-reply@ruralpop.com>`,
            to: [email],
            subject: `Recupera tu contraseña en ${tenantName}`,
            html: emailHtml,
        });

        if (resendError) {
            console.error("Resend sending error:", resendError);
            return NextResponse.json(
                { success: false, message: "Error temporal al enviar el correo. Por favor, inténtalo más tarde." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Si tu correo está registrado, recibirás un enlace seguro para restablecer tu contraseña en unos minutos.",
        });
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Error inesperado";
        console.error("Unhandled error in forgot-password API:", errorMsg);
        return NextResponse.json(
            { success: false, message: "Ha ocurrido un error inesperado al procesar la solicitud." },
            { status: 500 }
        );
    }
}

/**
 * Memory / Decisiones Técnicas:
 * - Anti-Scanner Email Link: No apuntamos a /auth/v1/verify directamente porque Microsoft Defender (Hotmail/Outlook)
 *   hace un GET previo y quema el OTP token de un solo uso antes de que el usuario lo abra.
 * - Usamos `token_hash` enviado directamente a `${siteUrl}/update-password?token_hash=...`.
 *   El escáner del antivirus recibe un HTML inocuo y no quema el token; la sesión solo se valida
 *   cuando el navegador o la app móvil del usuario ejecutan `supabase.auth.verifyOtp()`.
 */
