export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    subject: string;
    htmlContent: string;
}

const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: center; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .logo { width: 150px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827; }
    .text { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 32px; text-align: left; }
    .text-center { text-align: center; }
    .button { display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; }
    .footer { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center;}
`;

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: "nuevo-registro",
        name: "Nuevo Registro",
        description: "Email automático de bienvenida enviado al crear cuenta.",
        category: "Transaccional",
        subject: "¡Bienvenido/a a Ruralpop!",
        htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container">
        <img src="https://www.ruralpop.com/ruralpop-logo.png" alt="Ruralpop" class="logo" />
        <h1 class="title">¡Hola, Usuario!</h1>
        <p class="text text-center">
            Te damos la bienvenida a <strong>Ruralpop</strong>.<br/><br/>
            Estamos encantados de tenerte con nosotros en el gran mercado ganadero y agrícola que es Ruralpop. Empieza a vender y comprar ya! Descubre los mejores anuncios, gestiona tus favoritos y conecta con miles de usuarios al instante.
        </p>
        <a href="https://www.ruralpop.com/account" class="button" style="color: #ffffff; text-decoration: none;">Entrar a Ruralpop</a>
        <p class="footer">
            Estás recibiendo este correo porque tienes una cuenta en Ruralpop.<br/><br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    },
    {
        id: "fabricantes-tractores",
        name: "Fabricantes de Tractores",
        description: "Invitación para marcas de tractores promoviendo el catálogo.",
        category: "Captación",
        subject: "Destaca tus modelos en el nuevo Catálogo de Tractores de Ruralpop 🚜",
        htmlContent: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>${baseStyles}</style>
</head>
<body>
    <div class="container">
        <img src="https://www.ruralpop.com/ruralpop-logo.png" alt="Ruralpop" class="logo" />
        <h1 class="title">El escaparate agrícola líder en España</h1>
        <p class="text">
            Hola,<br/><br/>
            En <strong>Ruralpop</strong> estamos lanzando la guía y catálogo definitivo de tractores y maquinaria agrícola para conectar cientos de miles de agricultores profesionales con las principales marcas y distribuidores del país.
            <br/><br/>
            Hemos reservado un espacio destacado para asegurar que los modelos de vuestra casa comercial lleguen directamente a la pantalla de nuestro público objetivo en el momento que más los necesitan.
        </p>
        <a href="https://www.ruralpop.com/catalogo" class="button" style="color: #ffffff; text-decoration: none;">Ver Catálogo de Tractores</a>
        <p class="text" style="margin-top: 32px">
            Si desean ampliar información sobre cómo posicionar sus últimos lanzamientos en portada, respondan a este mismo correo y nuestro equipo se pondrá en contacto a la máxima brevedad.
        </p>
        <p class="footer">
            Ruralpop - El mercado del campo<br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    }
];
