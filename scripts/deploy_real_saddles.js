const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EQUIPOP_TENANT_ID = '69d55371-2f70-4e67-b55c-4502bce305bb';
const GHOST_USER_ID = '5902a215-7d21-4068-9971-4effd6a0448c';

const NEW_SADDLES = [
    {
        keyPrefix: 'bates_artiste',
        title: 'Silla Inglesa Doma Clásica Bates Artiste',
        title_pt: 'Sela Inglesa de Adestramento Bates Artiste',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de doma',
        price: 4950,
        price_type: 'fixed',
        shipping_price: 25.00,
        vender_online: true,
        is_featured: true,
        tags: ['silla de doma', 'bates artiste', 'doma clasica', 'hart', 'luxe leather', 'silla inglesa'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/95660-thickbox_default/silla-inglesa-doma-clasica-bates-artiste.jpg',
            'https://www.tiendahipicaonline.es/95661-thickbox_default/silla-inglesa-doma-clasica-bates-artiste.jpg',
            'https://www.tiendahipicaonline.es/95662-thickbox_default/silla-inglesa-doma-clasica-bates-artiste.jpg',
            'https://www.tiendahipicaonline.es/95663-thickbox_default/silla-inglesa-doma-clasica-bates-artiste.jpg',
            'https://www.tiendahipicaonline.es/95664-thickbox_default/silla-inglesa-doma-clasica-bates-artiste.jpg'
        ],
        description: `Silla inglesa de doma clásica Bates Artiste. Diseñada para posicionar al jinete de forma natural y permitir la máxima conexión con el caballo.

Características principales:
- Asiento ergonómico SweetSpot: guía al jinete a una posición neutral sin esfuerzo, facilitando la libertad de cadera.
- Sistema de paneles Synergy Panel: perfil ultra bajo para un contacto cercano insuperable y reparto uniforme del peso sobre el dorso.
- Tacos móviles Flexicontourbloc: fijación y soporte anatómico ajustable para la pierna en posición óptima.
- Tecnología HART (Horse and Rider Technology): armadura elastimérica adaptable, bastes de aire CAIR amortiguantes y sistema EASY-CHANGE para ajuste de puente.
- Piel Luxe Leather de la más alta calidad: tacto suave, adherencia extraordinaria y durabilidad profesional.`,
        description_pt: `Sela inglesa de adestramento clássico Bates Artiste. Projetada para posicionar o cavaleiro de forma natural e permitir a máxima conexão com o cavalo.

Principais características:
- Assento ergonômico SweetSpot: guia o cavaleiro para uma posição neutra sem esforço, facilitando a liberdade dos quadris.
- Sistema de painéis Synergy Panel: perfil ultra baixo para um contato próximo insuperável e distribuição uniforme do peso no dorso.
- Blocos móveis Flexicontourbloc: fixação e suporte anatômico ajustável para a perna na posição ideal.
- Tecnologia HART (Horse and Rider Technology): armação elastomérica adaptável, painéis de ar CAIR amortecedores e sistema EASY-CHANGE de ajuste.
- Couro Luxe Leather da mais alta qualidade: toque macio, aderência extraordinária e durabilidade profissional.`
    },
    {
        keyPrefix: 'arena_monoflap',
        title: 'Silla Inglesa Doma Arena Monoflap',
        title_pt: 'Sela Inglesa de Adestramento Arena Monoflap',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de doma',
        price: 1215,
        price_type: 'fixed',
        shipping_price: 19.50,
        vender_online: true,
        is_featured: true,
        tags: ['silla de doma', 'arena monoflap', 'doma clasica', 'monofaldon', 'hart', 'silla inglesa'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/153167-thickbox_default/silla-inglesa-doma-arena-monoflap-.jpg',
            'https://www.tiendahipicaonline.es/153163-thickbox_default/silla-inglesa-doma-arena-monoflap-.jpg',
            'https://www.tiendahipicaonline.es/153165-thickbox_default/silla-inglesa-doma-arena-monoflap-.jpg',
            'https://www.tiendahipicaonline.es/153164-thickbox_default/silla-inglesa-doma-arena-monoflap-.jpg',
            'https://www.tiendahipicaonline.es/153166-thickbox_default/silla-inglesa-doma-arena-monoflap-.jpg'
        ],
        description: `Silla mono-faldón Arena de doma clásica. Ofrece un contacto estrecho y una comunicación precisa y armónica con el caballo.

Características principales:
- Diseño mono-faldón: proporciona un contacto ultra cercano entre la pierna del jinete y los costados del caballo.
- Taco exterior anatómico de tacto suave que fija la pierna de forma cómoda y relajada.
- Asiento profundo y ergonómico que facilita la alineación y el equilibrio vertical del jinete.
- Fabricación combinada de alta calidad: cuero vacuno europeo en asiento y zonas de contacto, con faldones sintéticos técnicos resistentes y fáciles de limpiar.
- Tecnología HART incorporada: sistema de paneles de aire CAIR y sistema de cambio rápido de puente EASY-CHANGE.`,
        description_pt: `Sela mono-aba Arena de adestramento clássico. Oferece contato próximo e comunicação precisa e harmoniosa com o cavalo.

Principais características:
- Design mono-aba: proporciona contato ultra próximo entre a perna do cavaleiro e os flancos do cavalo.
- Tacão externo anatômico de toque suave que fixa a perna de forma confortável e relaxada.
- Assento profundo e ergonômico que facilita o alinhamento e o equilíbrio vertical do cavaleiro.
- Fabricação combinada de alta qualidade: couro bovino europeu no assento e áreas de contato, com abas sintéticas técnicas resistentes.
- Tecnologia HART incorporada: sistema de painéis de ar CAIR e sistema de troca rápida de arco EASY-CHANGE.`
    },
    {
        keyPrefix: 'kieffer_jump_vario',
        title: 'Silla de Salto Kieffer Jump Vario',
        title_pt: 'Sela de Salto Kieffer Jump Vario',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de salto',
        price: 3910,
        price_type: 'fixed',
        shipping_price: 22.00,
        vender_online: true,
        is_featured: true,
        tags: ['silla de salto', 'kieffer jump vario', 'kieffer', 'salto obstaculos', 'norbert koof', 'silla salto'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/27388-thickbox_default/silla-de-salto-kieffer-jump-vario.jpg',
            'https://www.tiendahipicaonline.es/95965-thickbox_default/silla-de-salto-kieffer-jump-vario.jpg'
        ],
        description: `Silla de salto profesional Kieffer Jump Vario, evolución perfeccionada del aclamado modelo Norbert Koof AT fabricada en Alemania.

Características principales:
- Asiento plano con curva deportiva estudiada para permitir máxima agilidad y libertad de movimientos en la batida y recepción del salto.
- Rodilleras y tacos para pantorrillas ajustables mediante sistema de velcro de alta sujeción para personalizar la posición y el apoyo de la pierna.
- Faldón anatómico preformado en cuero vacuno suave de primera calidad con excepcional agarre.
- Armadura Exclusive con puente adaptable en frío para un ajuste milimétrico al caballo.
- Bastes anatómicos acolchados rellenos de lana suave tapizada.
- Latiguillos cortos específicos para cinchas de salto.`,
        description_pt: `Sela de salto profissional Kieffer Jump Vario, evolução aprimorada do consagrado modelo Norbert Koof AT fabricada na Alemanha.

Principais características:
- Assento plano com curvatura esportiva projetada para permitir máxima agilidade e liberdade de movimentos no salto.
- Joelheiras e blocos de panturrilha ajustáveis por velcro de alta fixação para personalizar o apoio da perna.
- Aba anatômica pré-formada em couro bovino macio de primeira qualidade com aderência excepcional.
- Armação Exclusive com arco ajustável a frio para encaixe milimétrico no cavalo.
- Suportes anatômicos acolchoados preenchidos com lã macia estofada.
- Tiras curtas específicas para barrigueiras de salto.`
    },
    {
        keyPrefix: 'kieffer_palmanova',
        title: 'Silla Kieffer de Salto Palmanova',
        title_pt: 'Sela Kieffer de Salto Palmanova',
        category: 'sillas-de-montar-y-accesorios',
        subcategory: 'Sillas de salto',
        price: 2850,
        price_type: 'fixed',
        shipping_price: 19.50,
        vender_online: true,
        is_featured: true,
        tags: ['silla de salto', 'kieffer palmanova', 'kieffer', 'cuero castaño', 'salto obstaculos', 'silla salto'],
        imageSourceUrls: [
            'https://www.tiendahipicaonline.es/99921-thickbox_default/silla-kieffer-de-salto-palmanova.jpg',
            'https://www.tiendahipicaonline.es/99922-thickbox_default/silla-kieffer-de-salto-palmanova.jpg',
            'https://www.tiendahipicaonline.es/99923-thickbox_default/silla-kieffer-de-salto-palmanova.jpg',
            'https://www.tiendahipicaonline.es/99924-thickbox_default/silla-kieffer-de-salto-palmanova.jpg',
            'https://www.tiendahipicaonline.es/99925-thickbox_default/silla-kieffer-de-salto-palmanova.jpg'
        ],
        description: `Silla Kieffer de salto modelo Palmanova con asiento plano de diseño deportivo. Máxima comodidad, equilibrio y flexibilidad tanto para el jinete como para el caballo.

Características principales:
- Armadura 1000 Exclusive regulable y bastes rellenos de lana suave tapizada, readaptables tantas veces como sea necesario.
- Bloques de velcro para rodillas y pantorrillas que permiten personalizar la sensación de asiento y el apoyo de la pierna.
- Cuero doble con textura antideslizante de gran agarre y solapa preformada para una firmeza impecable en el salto.
- Elegante diseño en cuero color castaño con finas costuras de contraste en tono crema que desarrollan una pátina única.
- Latiguillos cortos para cincha de salto.`,
        description_pt: `Sela Kieffer de salto modelo Palmanova com assento plano de design esportivo. Máximo conforto, equilíbrio e flexibilidade para cavaleiro e cavalo.

Principais características:
- Armação 1000 Exclusive regulável e arções preenchidos com lã macia estofada, reajustáveis conforme a musculatura do cavalo.
- Blocos de velcro para joelhos e panturrilhas que permitem personalizar o apoio e o posicionamento da perna.
- Couro duplo com textura antiderrapante de ótima aderência e aba pré-moldada para firmeza impecável no salto.
- Design refinado em couro castanho com costuras contrastantes em tom creme que desenvolvem uma pátina distinta.
- Tiras curtas para barrigueira de salto.`
    }
];

async function deploySaddles() {
    console.log("=== INICIANDO SUBIDA DE LAS 4 SILLAS REALES PARA CORNER PRO ===");

    // 1. Eliminar las 2 sillas genéricas antiguas de Corner Pro
    console.log("1. Eliminando sillas genéricas anteriores...");
    const oldGenericIds = [
        '80907f16-1a32-4da4-9407-a5e572cf6aac',
        'd45e094f-c107-4007-b8ef-e5054c7374d2'
    ];
    const { error: delErr } = await supabase
        .from('listings')
        .delete()
        .in('id', oldGenericIds);

    if (delErr) {
        console.warn("Aviso al eliminar sillas antiguas:", delErr);
    } else {
        console.log("Sillas genéricas anteriores eliminadas correctamente.");
    }

    // 2. Descargar y subir cada foto a Supabase Storage (wpublic/corner-pro/saddles/...)
    const newItemsToInsert = [];

    for (const saddle of NEW_SADDLES) {
        console.log(`\nProcesando: ${saddle.title}...`);
        const uploadedUrls = [];

        for (let idx = 0; idx < saddle.imageSourceUrls.length; idx++) {
            const imgUrl = saddle.imageSourceUrls[idx];
            console.log(`  - Descargando imagen ${idx + 1}/${saddle.imageSourceUrls.length}: ${imgUrl}`);
            try {
                const res = await fetch(imgUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
                });

                if (!res.ok) {
                    console.error(`    Error al descargar: HTTP ${res.status}`);
                    continue;
                }

                const buffer = Buffer.from(await res.arrayBuffer());
                const storagePath = `corner-pro/saddles/${saddle.keyPrefix}_${idx + 1}.jpg`;

                const { error: upErr } = await supabase.storage
                    .from('wpublic')
                    .upload(storagePath, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (upErr) {
                    console.error(`    Error al subir a Supabase:`, upErr);
                    uploadedUrls.push(imgUrl);
                } else {
                    const publicUrl = supabase.storage.from('wpublic').getPublicUrl(storagePath).data.publicUrl;
                    console.log(`    -> Subida OK: ${publicUrl}`);
                    uploadedUrls.push(publicUrl);
                }
            } catch (err) {
                console.error(`    Excepción al procesar imagen:`, err.message);
                uploadedUrls.push(imgUrl);
            }
        }

        newItemsToInsert.push({
            title: saddle.title,
            title_pt: saddle.title_pt,
            description: saddle.description,
            description_pt: saddle.description_pt,
            price: saddle.price,
            price_type: saddle.price_type,
            shipping_price: saddle.shipping_price,
            vender_online: saddle.vender_online,
            is_featured: saddle.is_featured,
            category: saddle.category,
            subcategory: saddle.subcategory,
            equipop_category: saddle.category,
            equipop_subcategory: saddle.subcategory,
            tags: saddle.tags,
            image_urls: uploadedUrls,
            user_id: GHOST_USER_ID,
            tenant_id: EQUIPOP_TENANT_ID,
            location: 'Madrid (Madrid)',
            province_id: 28,
            municipality_id: 28127,
            contact_phone: '+34 918 420 891',
            status: 'active',
            shared_to_equipop: false
        });
    }

    // 3. Insertar las 4 monturas en public.listings
    console.log("\n3. Insertando las 4 sillas en Supabase listings...");
    const { data: inserted, error: insErr } = await supabase
        .from('listings')
        .insert(newItemsToInsert)
        .select('id, title, category, subcategory, price, image_urls');

    if (insErr) {
        console.error("Error al insertar sillas:", insErr);
        process.exit(1);
    }

    console.log(`\n¡Éxito! ${inserted.length} sillas añadidas al catálogo de Corner Pro:`);
    inserted.forEach(item => {
        console.log(`- [${item.id}] ${item.title}`);
        console.log(`  Subcategoría: ${item.subcategory} | Precio: ${item.price} €`);
        console.log(`  Fotos: ${item.image_urls.length} imágenes`);
    });

    console.log("\n=== OPERACIÓN COMPLETADA CON ÉXITO ===");
}

deploySaddles();
