import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';

export async function sendWelfareReminderEmail(
  email: string,
  listing: { id: string; title: string; image_urls?: string[] }
) {
  if (!email || !listing.id) {
    console.error('sendWelfareReminderEmail: Missing email or listing.id');
    return false;
  }

  const imageUrl =
    listing.image_urls && listing.image_urls.length > 0
      ? listing.image_urls[0]
      : 'https://www.ruralpop.com/apple-icon.png';

  const actionUrl = `${SITE_URL}/dashboard/validar-perfil?listingId=${listing.id}`;

  const emailHtmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2F8A43; text-align: center;">¡Tu anuncio casi está listo!</h2>
      <p style="text-align: center; font-size: 16px;">
        Hemos guardado tu anuncio, pero por la Ley de Bienestar Animal (Ley 7/2023) necesitamos que valides tu perfil como profesional introduciendo tu <strong>Nº de Reg. Zoológico / Explotación / Criadero</strong>.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
        <img src="${imageUrl}" alt="Foto del anuncio" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
        <h3 style="margin: 0; font-size: 18px; color: #111;">${listing.title}</h3>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Estado: <strong>Borrador (Pendiente de validar)</strong></p>
        
        <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background-color: #2F8A43; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">
          Validar Perfil y Publicar Anuncio
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
        Si tienes dudas, responde a este correo y te ayudaremos.<br/>
        El equipo de Ruralpop 🚜
      </p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Ruralpop <hola@ruralpop.com>',
      to: [email],
      subject: 'Tu anuncio está pendiente de publicar 🚜',
      html: emailHtmlBody,
    });

    console.log(`Welfare reminder email sent to ${email} for listing ${listing.id}`, data);
    return true;
  } catch (error) {
    console.error('Error sending welfare reminder email:', error);
    return false;
  }
}
