import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, paymentIntent, items } = await req.json();

    if (!email || !items) {
      return NextResponse.json({ error: 'Missing email or items' }, { status: 400 });
    }

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.title}</strong>
          ${item.size ? `<br/><small>Talla: ${item.size}</small>` : ''}
          <br/><small>Cantidad: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)}€
        </td>
      </tr>
    `).join('');

    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 0; // Envío gratis

    const emailHtmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2F8A43;">¡Gracias por tu pedido en Ruralpop!</h2>
        <p>Hemos recibido tu pedido correctamente y pronto nos pondremos con él. <strong>Entrega estimada 4-5 días.</strong></p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
                <td style="padding: 10px; text-align: right; font-weight: bold;">Envío:</td>
                <td style="padding: 10px; text-align: right;">Gratis</td>
            </tr>
            <tr>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em; color: #2F8A43;">${total.toFixed(2)}€</td>
            </tr>
            </table>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; pt-2;">
          Referencia de pago: ${paymentIntent}<br/>
          El equipo de Ruralpop 🚜
        </p>
      </div>
    `;

    // 1. Email al Comprador
    const buyerData = await resend.emails.send({
      from: 'Ruralpop Tienda <hola@ruralpop.com>',
      to: [email],
      subject: 'Confirmación de tu pedido en Ruralpop 🚜',
      html: emailHtmlBody,
    });

    // 2. Copia al Admin
    await resend.emails.send({
      from: 'Ruralpop Sistema <hola@ruralpop.com>',
      to: ['ruralpopapp@gmail.com'],
      subject: `🚨 Nuevo Pedido - ${email}`,
      html: emailHtmlBody,
    });

    return NextResponse.json({ success: true, buyerData });
  } catch (error) {
    console.error('Error sending order email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
