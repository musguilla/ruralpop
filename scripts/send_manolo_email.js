require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function main() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("Missing RESEND_API_KEY");
        return;
    }

    const resend = new Resend(apiKey);
    const recipient = 'manolodeabelendo@gmail.com';
    const logoUrl = 'https://www.ruralpop.com/ruralpop-logo.png';

    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: left; border: 1px solid #e5e7eb; }
        .logo { width: 160px; margin-bottom: 24px; display: block; margin-left: auto; margin-right: auto; }
        .title { font-size: 22px; font-weight: bold; margin-bottom: 16px; color: #111827; text-align: center; }
        .text { font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 20px; }
        .gift-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .gift-title { font-weight: bold; color: #065f46; font-size: 15px; margin-bottom: 4px; }
        .gift-text { color: #047857; font-size: 14px; line-height: 1.5; margin: 0; }
        .footer { margin-top: 36px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="Ruralpop" class="logo" />
        <h1 class="title">¡Tu anuncio de "Jaulas" ya está activo y destacado! 🌟</h1>
        
        <p class="text">
            Hola, Manuel:
        </p>

        <p class="text">
            Te escribimos directamente en respuesta a tu mensaje sobre la publicación de tu anuncio <strong>"Jaulas"</strong>.
        </p>

        <p class="text">
            Queremos pedirte sinceras disculpas por las molestias. Nuestra plataforma cuenta con filtros automáticos de revisión para cumplir con la normativa de bienestar animal que, en ocasiones, confunden de forma automatizada accesorios o jaulas con animales.
        </p>

        <p class="text">
            Pero queremos recordarte que <strong>detrás de la plataforma hay personas reales cuidando de nuestra comunidad</strong>. Tras revisar personalmente tu anuncio, <strong>ya lo hemos aprobado, publicado y activado con éxito.</strong>
        </p>

        <div class="gift-box">
            <div class="gift-title">🎁 Regalo de compensación: 7 Días de Destacado Gratis</div>
            <p class="gift-text">
                Como compensación por las molestias ocasionadas, <strong>te hemos regalado 7 días de Destacado totalmente gratis</strong>. Tu anuncio aparecerá en las primeras posiciones de Ruralpop con la estrella dorada para ayudarte a venderlo cuanto antes.
            </p>
        </div>

        <p class="text">
            Agradecemos mucho tu paciencia y tu confianza en Ruralpop. Estamos aquí para lo que necesites.
        </p>

        <p class="footer">
            Un cordial saludo,<br/>
            <strong>El equipo de Ruralpop</strong><br/>
            © ${new Date().getFullYear()} Ruralpop - Compra y venta para el mundo rural
        </p>
    </div>
</body>
</html>
    `;

    console.log("Sending email to:", recipient);
    const { data, error } = await resend.emails.send({
        from: 'Ruralpop <no-reply@ruralpop.com>',
        to: [recipient],
        subject: '¡Tu anuncio de "Jaulas" ya está activo y destacado en Ruralpop! 🌟',
        html: emailHtml
    });

    if (error) {
        console.error("Resend error:", error);
    } else {
        console.log("✅ Email sent successfully to Manolo! Data:", data);
    }
}

main();
