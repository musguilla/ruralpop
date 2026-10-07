import React from 'react';
import FAQClient from './FAQClient';
import { getServerTenantSlug, getServerTenantDomain } from "@/utils/tenant/server";
import { headers } from 'next/headers';
import { getHreflangLinks, getCanonicalUrl } from '@/i18n/utils';
import { LocaleCode } from '@/i18n/config';

export async function generateMetadata() {
    const tenant = await getServerTenantSlug();
    const currentDomain = await getServerTenantDomain();
    const isEquipop = tenant === 'equipop' || currentDomain.includes('equipop');
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';
    const pathname = isPt ? '/perguntas-frequentes' : '/preguntas-frecuentes';

    const title = isPt 
        ? `Perguntas Frequentes - ${brand}` 
        : `Preguntas Frecuentes - ${brand}`;

    const description = isPt
        ? `Encontra respostas às perguntas mais frequentes sobre como usar ${brand}: registo, publicar anúncios, contas profissionais e segurança.`
        : `Encuentra respuestas a las preguntas más frecuentes sobre cómo usar ${brand}: registrarse, subir anuncios, cuentas profesionales y seguridad.`;

    const canonical = getCanonicalUrl(pathname, locale, currentDomain);

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: getHreflangLinks(pathname, currentDomain)
        }
    };
}

export default async function FAQPage() {
    const tenant = await getServerTenantSlug();
    const currentDomain = await getServerTenantDomain();
    const isEquipop = tenant === 'equipop' || currentDomain.includes('equipop');
    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const domain = isEquipop ? 'equipop.app' : (currentDomain.includes('ruralpop.pt') ? 'ruralpop.pt' : 'ruralpop.com');
    const headersList = await headers();
    const locale = (headersList.get('x-locale') || 'es') as LocaleCode;
    const isPt = locale === 'pt';

    // FAQ Data definition for both rendering and Schema.org
    const faqs = isPt ? [
        {
            category: 'Conta',
            id: 'cuenta',
            questions: [
                {
                    q: `Como me registo no ${brand}?`,
                    a: '1. Clica no ícone de utilizador ou "Entrar / Registo" no canto superior direito do ecrã.\n2. Seleciona "Criar conta" ou usa diretamente a tua conta Google ou Apple para aceder rapidamente.\n3. Preenche os teus dados básicos e já está! Fazes parte da comunidade.'
                },
                {
                    q: 'Como elimino a minha conta?',
                    a: '1. Inicia sessão e acede ao teu "Perfil" no canto superior direito.\n2. Clica em "Definições".\n3. Na parte inferior, encontrarás a opção "Eliminar conta". Clica aí e segue os passos de segurança para confirmar o teu pedido.'
                },
                {
                    q: 'Como contacto outro utilizador por chat?',
                    a: `1. Encontra um anúncio do teu interesse.\n2. Na página do anúncio, clica no botão "Contactar".\n3. Escreve a tua mensagem e o utilizador irá recebê-la de imediato na sua caixa de mensagens do ${brand} e por email.`
                },
                {
                    q: `É seguro usar o ${brand}?`,
                    a: '1. Sim. Verificamos constantemente as contas profissionais.\n2. Dispomos de um sistema de denúncia em cada anúncio caso detetes algo suspeito.\n3. Mantemos a tua privacidade: os teus dados de contacto não são públicos a menos que decidas partilhá-los.'
                },
                {
                    q: 'É profissional ou empresa do setor?',
                    a: '1. Se tens uma empresa ou negócio ligado ao setor agrícola ou pecuário.\n2. Recomendamos criar diretamente uma conta Profissional para ter a tua própria montra digital e publicar anúncios sem limite.'
                }
            ]
        },
        {
            category: 'Anúncios',
            id: 'anuncios',
            questions: [
                {
                    q: `Como publico um anúncio no ${brand}?`,
                    a: `1. Com a sessão iniciada, clica no botão "Vender" na barra superior.\n2. Seleciona a categoria principal e subcategoria para o teu produto${isEquipop ? '' : ' ou animal'}.\n3. Carrega fotografias nítidas, define um título descritivo e o preço.\n4. Revê os dados e clica em publicar. Ficará logo visível para milhares de interessados.`
                },
                {
                    q: 'Quantos anúncios posso publicar?',
                    a: '1. Como utilizador Particular, podes publicar um número limitado de anúncios gratuitos ativos em simultâneo.\n2. Se fores Profissional ou Empresa, podes aderir a um Plano Pro e publicar tantos catálogos de produtos quantos o teu negócio necessitar.'
                },
                {
                    q: 'Como posso destacar os meus anúncios?',
                    a: '1. Acede ao teu perfil e depois a "Os meus anúncios".\n2. Junto ao anúncio que pretendes promover, clica na opção "Destacar".\n3. Estes anúncios surgem sempre no topo das pesquisas com destaque visual especial.'
                },
                {
                    q: 'Como elimino um anúncio?',
                    a: '1. Acede a "Os meus anúncios" a partir do menu de perfil.\n2. Localiza o anúncio a remover.\n3. Abre as opções (três pontos) e seleciona "Eliminar". O anúncio será imediatamente retirado do site.'
                }
            ]
        },
        {
            category: 'Profissionais',
            id: 'profesionales',
            questions: [
                {
                    q: 'Criar conta profissional',
                    a: '1. Acede à secção "Profissionais" na página inicial ou no menu.\n2. Seleciona e subscreve o plano mais adequado (mensal ou anual).\n3. Preenche os dados fiscais e os contactos públicos do teu negócio.'
                },
                {
                    q: 'Vantagens das contas profissionais',
                    a: `1. A tua própria página web (landing page) com o URL ${domain}/empresa/o-teu-nome.\n2. Publicação de anúncios ilimitados sem expiração.\n3. Selo de destaque nos teus anúncios que transmite maior confiança aos compradores.\n4. Estatísticas detalhadas de visualizações e contactos recebidos.`
                }
            ]
        },
        {
            category: 'Compras',
            id: 'compras',
            questions: [
                {
                    id: 'proteccion',
                    q: `Comprar com Proteção ${brand}`,
                    a: `Compra e vende com tranquilidade com a Proteção ${brand}. Desfruta de transações simples e seguras sem preocupações.\n\nO que é a Proteção ${brand}?\nA Proteção ${brand} proporciona uma experiência de compra segura e sem sobressaltos através do nosso sistema de pagamento protegido.\n\nComprar com Proteção ${brand}\nAo realizar uma compra, aplicamos uma taxa de serviço através da qual:\nO teu dinheiro fica seguro connosco enquanto verificas se o artigo recebido está correto (dispões de 7 dias após a confirmação de entrega pela transportadora). Se estiver tudo conforme, efetuamos o pagamento ao vendedor.\nSe o artigo recebido não coincidir com a descrição ou apresentar defeito, podes solicitar o reembolso.\n\nVender com Proteção ${brand}\nAo realizares as tuas vendas através do ${brand}:\nGuardamos o valor em segurança até que a encomenda chegue ao comprador e este confirme que está correta, ou após decorridos os 7 dias de verificação.\nA nossa equipa de apoio ao cliente está sempre disponível para ajudar.\n\nCompra e vende com confiança, nós tratamos do resto!`
                }
            ]
        }
    ] : [
        {
            category: 'Cuenta',
            id: 'cuenta',
            questions: [
                {
                    q: `¿Cómo me registro en ${brand}?`,
                    a: '1. Haz clic en el icono de usuario o "Entrar / Registro" en la parte superior derecha de la pantalla.\n2. Selecciona "Crear cuenta" o usa directamente tu cuenta de Google o Apple para acceder rápidamente.\n3. Rellena tus datos básicos y ¡listo! Ya eres parte de la comunidad.'
                },
                {
                    q: '¿Cómo elimino mi cuenta?',
                    a: '1. Inicia sesión y ve a tu "Perfil" en la esquina superior derecha.\n2. Haz clic en "Ajustes".\n3. En la parte inferior, verás la opción "Eliminar cuenta". Pulsa ahí y sigue los pasos de seguridad para confirmar tu solicitud.'
                },
                {
                    q: '¿Cómo contacto con otro usuario por chat?',
                    a: `1. Encuentra un anuncio que te interese.\n2. En la página del anuncio, haz clic en el botón "Contactar".\n3. Escribe tu mensaje y el usuario lo recibirá al instante en su buzón de ${brand} y por correo electrónico.`
                },
                {
                    q: `¿Es seguro usar ${brand}?`,
                    a: '1. Sí. Verificamos constantemente las cuentas profesionales.\n2. Contamos con un sistema de reportes en cada anuncio por si ves algo sospechoso.\n3. Mantenemos tu privacidad intacta: tus datos de contacto no son públicos a menos que tú decidas compartirlos.'
                },
                {
                    q: '¿Eres profesional o empresa del sector?',
                    a: '1. Si tienes una empresa o negocio relacionado con el sector.\n2. Te recomendamos crear directamente una cuenta Profesional para disfrutar de tu propio escaparate digital y subir anuncios sin límite.'
                }
            ]
        },
        {
            category: 'Anuncios',
            id: 'anuncios',
            questions: [
                {
                    q: `¿Cómo subo un anuncio a ${brand}?`,
                    a: `1. Una vez logueado, haz clic en el botón verde "Vender" de la barra superior.\n2. Selecciona la categoría principal y subcategoría para tu producto${isEquipop ? '' : ' o animal'}.\n3. Sube fotos claras, pon un título descriptivo y un precio.\n4. Revisa los datos y dale a publicar. Ya estará visible para miles de personas.`
                },
                {
                    q: '¿Cuántos anuncios puedo subir?',
                    a: '1. Si eres un usuario Particular, puedes subir un número limitado de anuncios gratuitos activos al mismo tiempo.\n2. Si eres Profesional o Empresa, puedes pasarte a un Plan Pro y subir tantos catálogos de productos como tu negocio necesite.'
                },
                {
                    q: '¿Cómo puedo destacar mis anuncios?',
                    a: '1. Entra a tu perfil y luego a tus "Anuncios".\n2. Al lado del anuncio que quieras potenciar, verás una opción "Destacar".\n3. Estos anuncios aparecerán siempre arriba en las búsquedas y tendrán un resaltado especial.'
                },
                {
                    q: '¿Cómo elimino un anuncio?',
                    a: '1. Ve a "Mis Anuncios" desde tu menú de perfil.\n2. Localiza el anuncio a borrar.\n3. Accede a sus opciones (los tres puntitos) y selecciona "Eliminar". Se retirará de inmediato de la web.'
                }
            ]
        },
        {
            category: 'Profesionales',
            id: 'profesionales',
            questions: [
                {
                    q: 'Crear cuenta de profesional',
                    a: '1. Dirígete a la sección "Profesionales" en la página de inicio o en el menú.\n2. Selecciona y paga la suscripción que mejor se adapte (mensual o anual).\n3. Rellena los datos fiscales y de contacto público de tu negocio.'
                },
                {
                    q: 'Beneficios cuentas profesionales',
                    a: `1. Tu propia página web (landing page) con la URL ${domain}/empresa/tu-nombre.\n2. Publicación de anuncios ilimitados sin caducidad.\n3. Etiqueta destacada en tus anuncios que da mayor confianza a los compradores.\n4. Estadísticas detalladas de visualizaciones y contactos recibidos.`
                }
            ]
        },
        {
            category: 'Compras',
            id: 'compras',
            questions: [
                {
                    id: 'proteccion',
                    q: `Comprar con Protección ${brand}`,
                    a: `Compra y vende con tranquilidad con Protección ${brand}. Disfruta de transacciones fáciles y seguras y no te preocupes de nada más.\n\n¿Qué es Protección ${brand}?\nProtección ${brand} proporciona una experiencia de compra sencilla y sin preocupaciones mediante nuestro servicio de pago seguro.\n\nComprar con Protección ${brand}\nAl realizar una compra, aplicamos un cargo obligatorio mediante el cual:\nTu dinero está seguro con nosotros mientras compruebas que lo que has recibido es correcto (Dispones de 7 días desde la confirmación de entrega del producto por parte de la compañia de transporte). Si todo está bien, pasado ese plazo pagaremos al vendedor.\nSi lo que has recibido no coincide con la descripción o está defectuoso tienes la posibilidad de solicitar un reembolso.\n\nVender con Protección ${brand}\nRealizando tus ventas a través de ${brand}:\nMantenemos el dinero seguro hasta que el producto llegue al comprador y confirme que es correcto o hayan transcurrido 7 días que tiene para comprobarlo.\nNuestro equipo de atención al cliente está siempre a tu disposición.\n\nCompra y vende sin preocupaciones, ¡nosotros nos encargamos del resto!`
                }
            ]
        }
    ];

    // Build the Schema.org JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.flatMap(cat => cat.questions.map(q => ({
            "@type": "Question",
            "name": q.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q.a.replace(/\n/g, ' ')
            }
        })))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <FAQClient faqs={faqs} brand={brand} />
        </>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Soporte multilingüe completo (ES / PT): detecta locale del header inyectado por middleware.
 * - En Portugal (.pt) muestra preguntas y respuestas en portugués europeo nativo y genera JSON-LD en PT.
 * - Implementación de un Schema JSON-LD dinámico `FAQPage` vital para SEO (Google Rich Snippets).
 * - Componente Server-side por defecto en app-router para que el indexado sea perfecto.
 */
