require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient('https://zrpucbuvojskcwrhwevv.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

async function run() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, image_urls')
    .not('image_urls', 'is', null)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.log("Error or no data");
    return;
  }
  
  const listing = data[0];
  console.log("Using listing:", listing.title, "Image:", listing.image_urls[0]);

  const imageUrl = listing.image_urls[0];
  const actionUrl = `${SITE_URL}/dashboard/destacar/${listing.id}`;

  let subject = '¡Tu anuncio está triunfando! 🎉';
  let heading = subject;
  let bodyText = `
    ¡Enhorabuena! Muchos usuarios están guardando tu anuncio como favorito (ya ha alcanzado los <strong>10 likes</strong>). 
    <br/><br/>
    No pierdas la oportunidad de cerrar la venta hoy mismo. <strong>Destácalo</strong> para que todos estos usuarios y cientos de compradores más lo vean en primera posición.
  `;
  let buttonText = 'Destacar mi anuncio ahora';

  const emailHtmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2F8A43; text-align: center; font-size: 24px; margin-top: 0;">${heading}</h2>
      <p style="text-align: center; font-size: 16px; line-height: 1.6; color: #4b5563;">
        ${bodyText}
      </p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
        <img src="${imageUrl}" alt="Foto del anuncio" width="150" height="150" style="display: block; margin: 0 auto 15px auto; width: 150px; height: 150px; object-fit: cover; border-radius: 12px;" />
        <h3 style="margin: 0; font-size: 18px; color: #111;">${listing.title}</h3>
        
        <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background-color: #2F8A43; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">
          ${buttonText}
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
        El equipo de Ruralpop 🚜
      </p>
    </div>
  `;

  try {
    const res = await resend.emails.send({
      from: 'Ruralpop <hola@ruralpop.com>',
      to: ['info@musguilla.com'],
      subject: subject,
      html: emailHtmlBody,
    });
    console.log("Sent successfully", res);
  } catch (err) {
    console.error("Error sending", err);
  }
}
run();
