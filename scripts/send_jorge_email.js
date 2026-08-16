require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function main() {
    const apiKey = process.env.RESEND_API_KEY;
    console.log("Resend API Key present:", !!apiKey);
    if (!apiKey) {
        console.error("Missing RESEND_API_KEY");
        return;
    }

    const resend = new Resend(apiKey);
    const recipient = 'jorgedominguezviqueira@gmail.com';
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
        .list-box { background-color: #f3f4f6; border-radius: 8px; padding: 16px 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .list-item { font-weight: 600; color: #1f2937; margin-bottom: 6px; font-size: 14px; }
        .gift-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .gift-title { font-weight: bold; color: #065f46; font-size: 15px; margin-bottom: 4px; }
        .gift-text { color: #047857; font-size: 14px; line-height: 1.5; margin: 0; }
        .button { display: block; width: 200px; margin: 28px auto 0; padding: 14px 28px; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; text-align: center; }
        .footer { margin-top: 36px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="Ruralpop" class="logo" />
        <h1 class="title">¡Tus anuncios ya están destacados en Ruralpop!</h1>
        
        <p class="text">
            Hola, Jorge:
        </p>

        <p class="text">
            Te escribimos desde el equipo de <strong>Ruralpop</strong> en relación a la contratación del servicio de destacado para tus anuncios.
        </p>

        <p class="text">
            Queremos confirmarte que <strong>tus 5 anuncios ya se encuentran completamente destacados y visibles en las primeras posiciones</strong> de la plataforma:
        </p>

        <div class="list-box">
            <div class="list-item">🐄 Novillas Frisonas</div>
            <div class="list-item">🌾 Segadora Kuhn GMD 702 GII Lift Control</div>
            <div class="list-item">🚜 Silo de pienso de 8000kg</div>
            <div class="list-item">🌾 Carro mezclador SEKO Samurai 3</div>
            <div class="list-item">💦 Sulfatadora Sanz 1150L</div>
        </div>

        <p class="text">
            Te pedimos sinceras disculpas por la pequeña demora en la activación. Sufrimos una breve incidencia técnica interna en nuestro sistema de notificaciones que ya ha sido completamente resuelta.
        </p>

        <div class="gift-box">
            <div class="gift-title">🎁 Regalo de compensación: +7 Días gratis</div>
            <p class="gift-text">
                Para compensarte por la espera, <strong>te regalamos 7 días adicionales</strong> de destacado gratis cuando finalicen los 20 días contratados, disfrutando de un total de <strong>27 días destacados</strong> en portada y búsquedas.
            </p>
        </div>

        <a href="https://www.ruralpop.com" class="button" style="color: #ffffff; text-decoration: none;">Ir a Ruralpop</a>

        <p class="footer">
            Agradecemos enormemente tu confianza en Ruralpop. Estamos a tu disposición para cualquier duda.<br/><br/>
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
        subject: 'Tus 5 anuncios ya están destacados en Ruralpop - Disculpas por la demora',
        html: emailHtml
    });

    if (error) {
        console.error("Resend error:", error);
    } else {
        console.log("✅ Email sent successfully! Data:", data);
    }
}

main();
