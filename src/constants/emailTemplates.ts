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
    },
    {
        id: "lanzamiento-compra-venta",
        name: "Lanzamiento: Compra y Venta Integrada",
        description: "Anuncio para todos los usuarios sobre la nueva funcionalidad de pagos y envíos integrados en la app.",
        category: "Novedades",
        subject: "¡Ya puedes comprar y vender directamente en Ruralpop! 🚀",
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
        <h1 class="title">¡Comprar y vender nunca fue tan fácil!</h1>
        <p class="text">
            Hola,<br/><br/>
            Tenemos una gran noticia que darte: <strong>¡La compra y venta integrada ya está disponible en Ruralpop!</strong>
            <br/><br/>
            A partir de ahora, ya no necesitas salir de la aplicación para cerrar tus tratos. Puedes realizar tus pagos de forma 100% segura y gestionar los envíos directamente desde tu móvil.
            <br/><br/>
            ✅ <strong>Pagos blindados:</strong> Tu dinero está protegido y solo se transfiere cuando recibes el artículo en buen estado.<br/>
            ✅ <strong>Envíos sencillos:</strong> Genera etiquetas y organiza la recogida sin dolores de cabeza.<br/>
            ✅ <strong>Garantía Ruralpop:</strong> Vende y compra maquinaria, herramientas o productos locales con total tranquilidad en toda España.
        </p>
        <a href="https://www.ruralpop.com/buscar" class="button" style="color: #ffffff; text-decoration: none;">Probar la Compra Segura</a>
        <p class="text" style="margin-top: 32px">
            Entra ahora, actualiza tu app si es necesario, y descubre la nueva forma de hacer negocios en el campo. ¡Te esperamos!
        </p>
        <p class="footer">
            Estás recibiendo este correo porque tienes una cuenta en Ruralpop.<br/><br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    },
    {
        id: "anuncio-destacado-30-dias",
        name: "Anuncio destacado 30 días",
        description: "Notifica al usuario que su anuncio ha sido destacado gratuitamente.",
        category: "Promocional",
        subject: "¡Tu anuncio ha sido destacado GRATIS por 30 días! 🚀",
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
        <h1 class="title">¡Enhorabuena! Tu anuncio vuela alto</h1>
        <p class="text">
            Tenemos una excelente noticia para ti. Hemos seleccionado tu anuncio y lo hemos <strong>Destacado gratis durante 30 días</strong>.
            <br/><br/>
            Al ser un anuncio destacado, disfrutarás de los siguientes beneficios:
            <br/><br/>
            ✅ <strong>Máxima visibilidad:</strong> Tu anuncio aparecerá en las primeras posiciones de las búsquedas en tu zona.<br/>
            ✅ <strong>Diseño VIP:</strong> Resaltado especial para captar la atención de los compradores rápidamente.<br/>
            ✅ <strong>Más contactos:</strong> Los anuncios destacados reciben hasta un 500% más de visitas y mensajes.
        </p>
        <a href="https://www.ruralpop.com/dashboard" class="button" style="color: #ffffff; text-decoration: none;">Ver mis anuncios</a>
        <p class="text" style="margin-top: 32px">
            No tienes que hacer nada, la promoción ya está activa. ¡Aprovecha para cerrar tu venta al mejor precio!
        </p>
        <p class="footer">
            Ruralpop - El mercado del campo<br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    },
    {
        id: "no-aplica-anuncio",
        name: "Rechazo: No aplica a Ruralpop",
        description: "Plantilla para notificar a un usuario que su anuncio ha sido eliminado por no encajar en la temática de la plataforma.",
        category: "Moderación",
        subject: "Tu anuncio ha sido eliminado de Ruralpop",
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
        <h1 class="title">Aviso de Moderación</h1>
        <p class="text">
            Hola,<br/><br/>
            Te contactamos desde el equipo de moderación de Ruralpop para informarte que tu anuncio ha sido eliminado.<br/><br/>
            Tras revisar el contenido, hemos determinado que no encaja en las categorías y la temática principal de nuestra plataforma, enfocada al sector agrícola, ganadero y rural.<br/><br/>
            Si crees que ha sido un error, no dudes en contactarnos.
        </p>
        <p class="footer">
            Ruralpop - El mercado del campo<br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    },
    {
        id: "ley-bienestar-animal",
        name: "Rechazo: Ley Bienestar Animal",
        description: "Plantilla para notificar a un usuario que su anuncio ha sido eliminado por incumplir la Ley de Bienestar Animal.",
        category: "Moderación",
        subject: "Importante: Tu anuncio ha sido eliminado por normativa vigente",
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
        <h1 class="title">Aviso Legal de Moderación</h1>
        <p class="text">
            Hola,<br/><br/>
            Te contactamos desde el equipo de moderación de Ruralpop para informarte que tu anuncio ha sido eliminado de la plataforma.<br/><br/>
            Te recordamos que la Ley de Bienestar Animal (Ley 7/2023) en España, vigente desde el 29 de septiembre de 2023, prohíbe terminantemente la venta directa de animales de compañía (perros, gatos, hurones, roedores, pájaros) a través de Internet, portales web o aplicaciones por usuarios no profesionales.<br/><br/>
            Para cumplir estrictamente con la legalidad, no podemos mantener este tipo de anuncios públicos.<br/><br/>
            En Ruralpop estamos comprometidos con la tenencia y adquisición responsable de animales de compañía y por ello solo permitimos anuncios con número de registro del núcleo zoológico por parte de usuarios profesionales que publican con el sello de "Profesional" y cuentan con <a href="https://www.ruralpop.com/empresas-profesionales-sector-rural" style="color: #10b981; font-weight: bold; text-decoration: none;">Ruralpop Plan Pro</a>.
        </p>
        <p class="footer">
            Agradecemos tu comprensión.<br/><br/>
            Ruralpop - El mercado del campo<br/>
            © ${new Date().getFullYear()} Ruralpop
        </p>
    </div>
</body>
</html>`
    }
];
