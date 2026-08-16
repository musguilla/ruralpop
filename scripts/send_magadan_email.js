require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function main() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("Missing RESEND_API_KEY");
        return;
    }

    const resend = new Resend(apiKey);
    const recipient = 'magadanjr@gmail.com';
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
        .footer { margin-top: 36px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="Ruralpop" class="logo" />
        <h1 class="title">Publicación y borrado de anuncios resuelto</h1>
        
        <p class="text">
            Hola, José Ramón:
        </p>

        <p class="text">
            Te escribimos para avisarte de que la incidencia puntual que impedía publicar y borrar anuncios ya ha sido totalmente solucionada.
        </p>

        <p class="text">
            Ya puedes publicar nuevos anuncios y eliminar los que necesites con total normalidad desde la <strong>App de Ruralpop</strong>.
        </p>

        <p class="text">
            Disculpa las molestias y muchas gracias por tu paciencia.
        </p>

        <p class="footer">
            Un saludo,<br/>
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
        subject: 'Publicación y borrado de anuncios resuelto en Ruralpop',
        html: emailHtml
    });

    if (error) {
        console.error("Resend error:", error);
    } else {
        console.log("✅ Email sent successfully to Jose Ramon! Data:", data);
    }
}

main();
