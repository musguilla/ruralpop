import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Now receives email and password from the client instead of newUserId
        const { ghostToken, email, password, tenant } = await req.json();

        if (!ghostToken || !email || !password) {
            return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Find the ghost profile
        const { data: ghostProfile, error: findError } = await supabaseAdmin
            .from('users')
            .select('id, is_ghost, ghost_token')
            .eq('ghost_token', ghostToken)
            .eq('is_ghost', true)
            .single();

        if (findError || !ghostProfile) {
            console.error("Ghost profile not found or already claimed:", findError);
            return NextResponse.json({ error: "Perfil no encontrado o ya reclamado." }, { status: 400 });
        }

        const oldGhostId = ghostProfile.id;

        // 2. Create the unconfirmed user via admin
        const { data: userResp, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
        });

        if (createError) {
            console.error("Error creating user for ghost claim:", createError);
            if (createError.message.includes("already registered") || createError.code === "user_already_exists") {
                return NextResponse.json({ error: "Este email ya está registrado. Inicia sesión primero o utiliza otro." }, { status: 400 });
            }
            return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
        }

        const newUserId = userResp.user.id;

        // 3. Let's get the full ghost data
        const { data: fullGhostData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', oldGhostId)
            .single();

        if (!fullGhostData) {
            // Delete the auth user if we fail here to avoid orphan accounts
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return NextResponse.json({ error: "No se pudo recuperar los datos del perfil" }, { status: 500 });
        }

        const { id, is_ghost, ghost_token, created_at, email: oldEmail, ...ghostDataToCopy } = fullGhostData;

        ghostDataToCopy.role = 'profesional';
        ghostDataToCopy.plan_type = 'free';
        ghostDataToCopy.is_ghost = true;
        ghostDataToCopy.ghost_token = ghost_token;

        // Update the newly created user row
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update(ghostDataToCopy)
            .eq('id', newUserId);

        if (updateError) {
            console.error("Error updating new user profile:", updateError);
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            return NextResponse.json({ error: "No se pudo preparar tu perfil" }, { status: 500 });
        }

        // Reassign listings
        const { error: listingsError } = await supabaseAdmin
            .from('listings')
            .update({ user_id: newUserId })
            .eq('user_id', oldGhostId);

        if (listingsError) {
            console.error("Error transferring listings:", listingsError);
        }

        // Delete the old ghost user
        await supabaseAdmin.from('users').delete().eq('id', oldGhostId);

        // 4. Generate and send verification email
        const isEquipop = tenant === 'equipop';
        const siteUrl = isEquipop ? "https://www.equipop.app" : "https://www.ruralpop.com";
        const tenantName = isEquipop ? "Equipop" : "Ruralpop";

        const { data: linkResp, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                redirectTo: `${siteUrl}/login?verified=true`
            }
        });

        if (process.env.RESEND_API_KEY && linkResp?.properties?.action_link) {
            const { Resend } = require('resend');
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
                    <h1 class="title">¡Bienvenido a ${tenantName}!</h1>
                    <p class="text">
                        Has reclamado exitosamente tu perfil profesional.<br/><br/>
                        Para acceder a tu cuenta y empezar a gestionar tus anuncios, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:
                    </p>
                    <a href="${validationLink}" class="button" style="color: #ffffff; text-decoration: none;">Validar Cuenta</a>
                    
                    <p class="fallback">
                        ¿No puedes ver o pulsar el botón? Copia y pega esta dirección en tu navegador:<br/>
                        <a href="${validationLink}" style="color: #10b981;">${validationLink}</a>
                    </p>

                    <p class="footer">
                        © ${new Date().getFullYear()} ${tenantName}
                    </p>
                </div>
            </body>
            </html>
            `;

            await resend.emails.send({
                from: fromEmail,
                to: [email],
                subject: `Verifica tu cuenta profesional de ${tenantName}`,
                html: emailHtml,
            });
        }

        return NextResponse.json({ success: true, message: "Revisa tu email para validar la cuenta" });

    } catch (err) {
        console.error("Claim API Error:", err);
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
    }
}
