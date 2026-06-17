require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  const emailHtmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb;">
      <h2 style="color: #2F8A43; text-align: center;">¡Tu anuncio está triunfando! 🎉</h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
        <img src="https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/listings/123/image.jpg" alt="Foto del anuncio" style="display: block; width: 150px; height: 150px; margin: 0 auto 15px auto; border-radius: 8px;" />
        <h3 style="margin: 0; font-size: 18px; color: #111;">Tractor John Deere 6150R</h3>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: 'Ruralpop <hola@ruralpop.com>',
    to: ['info@musguilla.com'],
    subject: 'Prueba de imagen 2',
    html: emailHtmlBody,
  });
  console.log("Email sent");
}
run();
