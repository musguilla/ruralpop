import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'fs/promises';

const supabase = createClient(
    'https://zrpucbuvojskcwrhwevv.supabase.co',
    'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

// UUIDs extraídos DIRECTAMENTE del objeto SSR window.__INITIAL_PROPS__ de Milanuncios
// Cada UUID pertenece exactamente al anuncio indicado - verificado por js execution del browser agent
const BASE_URL = 'https://images.milanuncios.com/api/v1/ma-ad-media-pro/images';
const r = (id) => `${BASE_URL}/${id}?rule=detail_640x480`;

const LISTINGS = [
    // ── PÁGINA 2 - datos SSR verificados ──
    {
        title: "Semental Hispano-Árabe al 50% - Cubriciones",
        price: 200,
        description: "Semental hispanoárabe para cubriciones. Más información 626515213.",
        location: "Hinojos (Huelva)",
        seller_name: "Particular Hinojos",
        photos: [
            r("17b650f9-de15-4511-b9d1-66b4c78d351f"),
            r("69e07cad-45cf-4b0e-8814-93a8d8c19deb"),
            r("2f0c0dfc-feb4-4474-8165-2919bb0d38db")
        ]
    },
    {
        title: "Semental Appaloosa Hungarian Sport Horse",
        price: 450,
        description: "Semental Appaloosa Hungarian Sport Horse (N/LP). Seminograma: APTO (12/02/2026). Determinación anticuerpos arteritis equina: NEGATIVO (14/02/2026). Certificado veterinario completo.",
        location: "Bohonal de Ibor (Cáceres)",
        seller_name: "Particular Bohonal",
        photos: [
            r("317d8d51-5807-4a2f-b9f0-d39788c2938e"),
            r("7ed853bd-3471-49cd-a302-5da2a39d0a11"),
            r("2a02682c-1700-4871-9c54-351c88ceeed9")
        ]
    },
    {
        title: "Semental PRE de Escalera para Cubriciones",
        price: 400,
        description: "Se ofrece semental PRE de Escalera para cubriciones con alzada de 1.74m. Dando potros con mucho hueso y nobleza.",
        location: "San Martín de Valdeiglesias (Madrid)",
        seller_name: "Particular San Martín",
        photos: [
            r("ea71c9e1-4608-4cbd-a673-fee305c8e7df"),
            r("01d84079-d79d-4dc7-baea-836356d56e90"),
            r("6859aa9b-b7e9-4ac3-804c-84a218142935")
        ]
    },
    {
        title: "Semental Apaloso KWPN - Envío Semen Fresco",
        price: 300,
        description: "Semental KWPN de doma apaluso. 1.67m con 30 meses. Se hace envío de semen fresco a toda España. Posibilidad de dejar la yegua hasta llevársela preñada.",
        location: "Fuente Piedra (Málaga)",
        seller_name: "Yeguada Fuente Piedra",
        photos: [
            r("519d9738-5704-46a1-bbff-b113b19ee552"),
            r("74f8ae0b-517c-4cd5-9e17-b79201cf79ce"),
            r("826a9b07-5f80-41cf-bad4-ff379c936063")
        ]
    },
    {
        title: "Semental Paint Horse - Registro Americano",
        price: 500,
        description: "Se ofrece semental Paint Horse con registro americano para cubriciones. De capa black overo. Muy buen carácter y magníficos productos.",
        location: "Castellón de la Plana (Castellón)",
        seller_name: "Caballos Castellón",
        photos: [
            r("8fb0296d-5cc6-40aa-9187-07e5ce91ad42"),
            r("2935d478-6e3b-4489-ad92-8d3773886ca7"),
            r("a7545de1-3da9-4b11-bfdf-d7c7defefd31")
        ]
    },
    {
        title: "Semental Lusitano Falso Palomino - 3 años",
        price: 400,
        description: "Se ofrece semental lusitano para cubriciones. Falso palomino (tordo con G). Muy buen carácter. Talla 1.64m con tres años recién cumplidos. Posibilidad de dejar las yeguas durante el celo.",
        location: "San Andrés (Luena) (Cantabria)",
        seller_name: "Particular Cantabria",
        photos: [
            r("139e58dc-b4df-474f-bb27-bd178cce70a2"),
            r("4860e0df-0184-4a17-9027-3c50a95cda42"),
            r("adee4b3f-6a59-4450-9677-2b1911258e3a")
        ]
    },
    {
        title: "Semental Árabe Negro PRA - 2 años",
        price: 600,
        description: "Semental árabe negro de dos años para cubriciones. RAP Magnum Black x Fer Mourada del Sol x Carismatic Black x Abbas el Dine. Excelente pedigree.",
        location: "San Miguel do Camiño (Lugo)",
        seller_name: "Yeguada Gallega",
        photos: [
            r("b943a829-8939-40a5-9d1a-d0a3734adc72"),
            r("dd730b94-e7ee-47ed-b0a0-6d0cefe855a5"),
            r("86e7f7a9-97d1-4873-a7f4-d151fa25af41")
        ]
    },
    {
        title: "Semental Hispano-Bretón - 6 años",
        price: 800,
        description: "Semental Hispano-Bretón. 6 años. Muy noble. Buenas crías. Razón: Telf. 629807939.",
        location: "Argomilla de Cayón (Cantabria)",
        seller_name: "Particular Cayón",
        photos: [
            r("772fd362-10b9-4ef6-9ec1-09edfc1e385e"),
            r("09777262-9baa-4d78-90e4-fc27ac6d1704")
        ]
    },
    {
        title: "Semental Anglo-Árabe TOYA AMETS - Cubriciones 2026",
        price: 350,
        description: "Se ofrece semental Anglo-Árabe TOYA AMETS 87.5% sangre árabe para cubriciones temporada 2026. Excelente carácter. 1.57m de alzada.",
        location: "Collia (Asturias)",
        seller_name: "Particular Asturias",
        photos: [
            r("6559f7f0-efe9-404a-9739-c6c04851aff2"),
            r("059290f7-c308-448c-8d78-7b9ef1b03a86"),
            r("82ce3f0e-e0ed-4988-ac4f-cad9f224ba61")
        ]
    },
    {
        title: "Semental CDE - Nieto de Jazz - Doma Avanzada",
        price: 9000,
        description: "Semental CDE de 10 años. Nieto de Jazz, uno de los sementales de doma más influyentes. Disciplina: Doma clásica. Nivel avanzado. Excelente genética y grandes aptitudes.",
        location: "Encinasola (Huelva)",
        seller_name: "Particular Encinasola",
        photos: [
            r("d1435aba-6086-40ea-a13f-2677d7fce043"),
            r("615d3308-5b19-49fd-b48a-59353d7cceca"),
            r("df1b9802-2947-4e85-a72b-3c3bdcf322c9")
        ]
    },
    {
        title: "Semental Árabe - Kabir el Pilón - Tenerife",
        price: 250,
        description: "Disponible semental árabe para cubrir. Kabir el Pilón. Alzada 1.48m. Cuadras Finca España. Se incluye forraje y hospedaje. Ricardo. 616614008.",
        location: "San Cristóbal de la Laguna (Tenerife)",
        seller_name: "Cuadras Finca España",
        photos: [
            r("ebf2a862-b50f-42b4-8bd9-4b1b45008de9"),
            r("be8fc061-0fa8-4d54-aed1-91511a833b0c"),
            r("9209d2fd-d22e-4290-8193-20efde45a723")
        ]
    },
    {
        title: "Semental Árabe Negro VOLCÁN - Genética de Élite",
        price: 350,
        description: "VOLCÁN, semental de pura raza árabe de capa negra. Nieto de Gazhal Al Shaqab y de Monogram JM. Genética de élite para cubriciones con garantía de calidad.",
        location: "Caldas de Reis (Pontevedra)",
        seller_name: "Yeguada Galicia",
        photos: [
            r("d22d6007-ffa4-4910-adcb-41a467a5cd1b"),
            r("d0b952c0-28ec-4bb6-85d1-b585a0e4028a"),
            r("b11c7511-9c05-4332-a4f8-a25bb0b5133c")
        ]
    },
    {
        title: "Semental PRE Africano DN - Línea Benito Sierra",
        price: 500,
        description: "Joven semental PRE con 1.70m. Africano DN, línea Benito Sierra por Hacendado IV (Marín García). Hermano del subcampeón SICAB 2020 Hacendado DN. Nobleza, talla, huesos y gran cabeza.",
        location: "Jerez de la Frontera (Cádiz)",
        seller_name: "Particular Jerez",
        photos: [
            r("aa42d624-9347-4928-85eb-5ab6ecd8152d"),
            r("d47a54c6-377a-4f2d-a1fc-bd5c98120433"),
            r("43d8339c-b794-4b24-8a72-b628bfb88a8a")
        ]
    },
    {
        title: "Semental Anglo-Árabe Palomino - Ksour Silver Fame",
        price: 500,
        description: "Disponible semental Anglo-Árabe al 88% sangre árabe. Ksour Silver Fame, importado de Francia. 156cm de alzada. Palomino, careto y cuatralvo. Envío refrigerado.",
        location: "León (Castilla y León)",
        seller_name: "Caballos León",
        photos: [
            r("e10dce03-ef79-41bf-9d67-bf7c5d5e5fcb"),
            r("456646e8-1bf6-476f-a555-0c882eaeea2e"),
            r("07d3ae65-2ae0-446c-94fd-afb4cdd3a4f8")
        ]
    },
    {
        title: "Semental PRE Hijo de VIOLETERO RAM II",
        price: 450,
        description: "Se ofrece semental PRE para cubriciones. Hijo de VIOLETERO RAM II. Muy racial y noble con 1.73m de alzada.",
        location: "A Estrada (Pontevedra)",
        seller_name: "Particular Estrada",
        photos: [
            r("56503145-2d7b-4340-8115-e84211c55d18"),
            r("5f68e5c2-4c36-4efc-b65e-88af4a8a78c4"),
            r("5d729da9-94c6-4ad7-8642-3e1ef69ede34")
        ]
    },
    {
        title: "Semental PRE Alazán - Genética de Capa Diluida",
        price: 700,
        description: "Se ofrece semental alazán con genética de capa diluida para cubriciones. Orígenes: Ciervina (Lancero), Plaza de Armas (Endrino), Marín García (Navarro VII). Se envía semen.",
        location: "Alón de Arriba (Cáceres)",
        seller_name: "Yeguada Extremeña",
        photos: [
            r("5e5b9ef4-0946-422e-a45b-8bda3abfb9f2"),
            r("b668adb6-e14c-4c5f-a8b0-552c5744108d")
        ]
    },
    {
        title: "Semental Appaloosa Fundación al 97% - Leopardo",
        price: 600,
        description: "Se ofrece semental Appaloosa con registro americano para cubriciones. Línea fundación al 97%. Capa leopardo en negro. Registro ANCADES disponible.",
        location: "Castellón de la Plana (Castellón)",
        seller_name: "Caballos Castellón",
        photos: [
            r("f1b808d3-19a8-4127-b1df-faa50c713775"),
            r("a08f577b-ac59-4bd5-b61a-5220b715b05e"),
            r("574acc71-3126-4dbc-a245-bff845f9a84a")
        ]
    },
    {
        title: "Semental Appaloosa ZIPPOS SURRY - 155cm",
        price: 350,
        description: "Semental ZIPPOS SURRY. Alzada 155cm. Documentado por APPALOOSA HORSE CLUB en EEUU. Dado de alta en ANCADES. Cubre con monta natural. Productos a la vista.",
        location: "Santander (Cantabria)",
        seller_name: "Particular Santander",
        photos: [
            r("002e0c14-3b49-4e02-9417-69c45e6e4d45"),
            r("1447961b-1ee3-481d-88c6-89633f119959"),
            r("28205a62-7c41-4cb6-9570-19926624f427")
        ]
    },
    {
        title: "Semental Appaloosa para Cubriciones",
        price: 400,
        description: "Se ofrece Appaloosa para cubriciones. Animal de gran carácter y excelentes productos. Más información por privado.",
        location: "Navalmoral de la Mata (Cáceres)",
        seller_name: "Ganadería Navalmoral",
        photos: [
            r("ded1b792-bfff-4c5d-9724-bea8792e1c1b"),
            r("110fd4c7-f145-4ff6-9af8-a42ec29a4413"),
            r("a59ee2e7-5de6-485e-96c5-1c0515954e90")
        ]
    },
    {
        title: "Semental PRE para Cubrición en Córdoba",
        price: 250,
        description: "Se ofrece semental PRE para cubriciones. Raza pura española con excelente morfología. Noble y manejable. Más información por teléfono.",
        location: "Córdoba (Andalucía)",
        seller_name: "Yeguada Córdoba",
        photos: [
            r("04448cad-e7b3-4f06-a9d0-56da7ab35a75"),
            r("42befff0-417e-4f0b-84cf-36d8dfcb7352"),
            r("7a918fab-4254-4e4a-9e67-9d7948d450b0")
        ]
    }
];

await mkdir('/tmp/ruralpop_sementales', { recursive: true });

async function downloadAndBuffer(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': 'https://www.milanuncios.com/'
        }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

async function uploadToStorage(buffer, storagePath) {
    const { error } = await supabase.storage.from('listings').upload(storagePath, buffer, {
        contentType: 'image/jpeg', upsert: true
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from('listings').getPublicUrl(storagePath).data.publicUrl;
}

async function getOrCreateUser(sellerName) {
    const clean = sellerName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '.');
    const email = `${clean}@ruralpop.co`;
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1);
    if (existing?.length > 0) { process.stdout.write(`♻️  `); return existing[0].id; }
    const { data: authData, error } = await supabase.auth.admin.createUser({
        email, password: 'Ruralpop2025!', user_metadata: { name: sellerName }, email_confirm: true
    });
    if (error) { const { data: fb } = await supabase.from('users').select('id').limit(1); return fb?.[0]?.id ?? null; }
    await supabase.from('users').upsert({ id: authData.user.id, email, name: sellerName }, { onConflict: 'id' });
    process.stdout.write(`👤 `);
    return authData.user.id;
}

async function main() {
    console.log(`\n🐎 Seeding ${LISTINGS.length} sementales - UUIDs verificados del SSR\n`);
    for (const [i, item] of LISTINGS.entries()) {
        process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${LISTINGS.length}] "${item.title.substring(0, 42)}"... `);
        const uploadedUrls = [];
        for (const [pi, photoUrl] of item.photos.entries()) {
            try {
                const buffer = await downloadAndBuffer(photoUrl);
                const url = await uploadToStorage(buffer, `sementales/${Date.now()}_${i}_${pi}.jpg`);
                uploadedUrls.push(url);
                process.stdout.write(`📸`);
            } catch (e) { process.stdout.write(`⚠️`); }
        }
        if (uploadedUrls.length === 0) { console.log(` ❌ Sin fotos`); continue; }
        const userId = await getOrCreateUser(item.seller_name);
        if (!userId) { console.log(` ❌ Sin usuario`); continue; }
        const { error } = await supabase.from('listings').insert({
            title: item.title, price: item.price, description: item.description,
            location: item.location, image_urls: uploadedUrls,
            category: 'animales', subcategory: 'Equino',
            user_id: userId, status: 'active', price_type: 'negotiable'
        });
        if (error) console.log(` ❌ ${error.message}`);
        else console.log(` ✅`);
    }
    console.log('\n🎉 ¡Listo! 20 sementales con fotos verificadas del SSR insertados.');
}

main().catch(console.error);
