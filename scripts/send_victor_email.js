require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function main() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error("Missing RESEND_API_KEY");
        return;
    }

    const resend = new Resend(apiKey);
    const recipient = 'victorlopezsantander@gmail.com';
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
        .footer { margin-top: 36px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="Ruralpop" class="logo" />
        <h1 class="title">Te contactaremos telefónicamente mañana</h1>
        
        <p class="text">
            Hola, Víctor:
        </p>

        <p class="text">
            Te escribimos desde el equipo de <strong>Ruralpop</strong> para pedirte sinceras disculpas por la confusión generada en tu cuenta.
        </p>

        <p class="text">
            Queremos confirmarte que <strong>mañana te contactaremos telefónicamente al 601 20 70 55</strong> para hablar directamente contigo, resolver cualquier duda y dejar tu cuenta perfectamente configurada a tu gusto.
        </p>

        <p class="text">
            Aprovechamos para darte la tranquilidad de que <strong>tus 3 anuncios se encuentran actualmente 100% activos, verificados con tu código REGA (ES390740001151) y recibiendo visitas con normalidad</strong>:
        </p>

        <div class="list-box">
            <div class="list-item">🐶 Mastín español cachorros</div>
            <div class="list-item">🐶 Mastines cachorros de 2 meses</div>
            <div class="list-item">🐶 Border collie blue merlé macho</div>
        </div>

        <p class="text">
            Mañana te llamamos y lo comentamos con calma por teléfono.
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
        subject: 'Re: Tu anuncio en Ruralpop - Te llamaremos mañana por teléfono',
        html: emailHtml
    });

    if (error) {
        console.error("Resend error:", error);
    } else {
        console.log("✅ Email sent successfully to Victor! Data:", data);
    }
}

main();
