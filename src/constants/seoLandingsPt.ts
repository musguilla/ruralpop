import { slugify } from "@/utils/seoUtils";

export interface SeoLanding {
    title: string;
    slug: string;
    subtitle?: string;
    category?: string;
    subcategory?: string;
    province?: string;
    searchQuery?: string;
    description: string;
    faqs: { question: string; answer: string }[];
}

const rawLandings = [
    { title: "Venda de animais de fazenda", category: "ganaderia" },
    { title: "Venda de animais em Sevilha", category: "ganaderia", province: "Sevilla" },
    { title: "Venda de Animais em Valência", category: "ganaderia", province: "Valencia" },
    { title: "Compra e venda de gado", category: "ganaderia" },
    { title: "Compra e venda de gado na Cantábria", category: "ganaderia", province: "Cantabria" },
    { title: "Compra e venda de gado no País Basco", category: "ganaderia", province: "País Vasco" },
    { title: "Pecuária nas Astúrias", category: "ganaderia", province: "Asturias" },
    { title: "Pecuária na Galiza", category: "ganaderia", province: "A Coruña" }, 
    { title: "Pecuária em Salamanca", category: "ganaderia", province: "Salamanca" },
    { title: "Pecuária em Zamora", category: "ganaderia", province: "Zamora" },
    { title: "Pecuária na Estremadura", category: "ganaderia", province: "Cáceres" },
    { title: "Porcos", category: "ganaderia", subcategory: "Porcino" },
    { title: "Vacas", category: "ganaderia", subcategory: "Bovino" },
    { title: "Tratores em segunda mão", subtitle: "Vende e compra tratores usados e seminovos", category: "maquinaria", searchQuery: "tractor" },
    { title: "Gado", category: "ganaderia" },
    { title: "Tratores usados", category: "maquinaria", searchQuery: "tractor" },
    { title: "Comprar maquinaria agrícola", category: "maquinaria" },
    { title: "Alimentação do gado", category: "forraje" },
    { title: "Comprar touro", category: "ganaderia", subcategory: "Bovino", searchQuery: "toro" },
    { title: "Comprar Vaca", category: "ganaderia", subcategory: "Bovino", searchQuery: "vaca" },
    { title: "Vacas para venda", category: "ganaderia", subcategory: "Bovino" },
    { title: "Gado para venda em Madrid", category: "ganaderia", province: "Madrid" },
    { title: "Gado para venda nas Astúrias", category: "ganaderia", province: "Asturias" },
    { title: "Gado para venda em Sevilha", category: "ganaderia", province: "Sevilla" },
    { title: "Gado para venda na Galiza", category: "ganaderia", province: "Lugo" },
    { title: "Gado para venda na Catalunha", category: "ganaderia", province: "Lleida" },
    { title: "Comprar gado em Madrid", category: "ganaderia", province: "Madrid" },
    { title: "Comprar gado na Estremadura", category: "ganaderia", province: "Cáceres" },
    { title: "Comprar gado no País Basco", category: "ganaderia", province: "Álava" },
    { title: "Comprar gado na Cantábria", category: "ganaderia", province: "Cantabria" },
    { title: "Tratores em segunda mão nas Astúrias", category: "maquinaria", province: "Asturias", searchQuery: "tractor" },
    { title: "Tratores em segunda mão na Galiza", category: "maquinaria", province: "A Coruña", searchQuery: "tractor" },
    { title: "Tratores usados em Madrid", category: "maquinaria", province: "Madrid", searchQuery: "tractor" },
    { title: "Trator em segunda mão em Bilbau", category: "maquinaria", province: "Bizkaia", searchQuery: "tractor" },
    { title: "Trator usado em Valência", category: "maquinaria", province: "Valencia", searchQuery: "tractor" },
    
    // --- NUEVAS CATEGORIAS HARDCODEADAS PARA SEO ---
    { title: "Quintas rústicas", category: "fincas", description: "Encontre quintas rústicas, terrenos e parcelas agrícolas para venda e arrendamento." },
    { title: "Quintas na Andaluzia", category: "fincas", province: "Sevilla" },
    { title: "Quintas na Galiza", category: "fincas", province: "A Coruña" },
    { title: "Material de Apicultura", category: "ganaderia", subcategory: "Apicultura" },
    { title: "Ceifeiras-debulhadoras em segunda mão", category: "maquinaria", subcategory: "Cosechadoras" },
    { title: "Gadanheiras de ocasião", category: "maquinaria", subcategory: "Segadoras" },
    { title: "Roçadoras florestais e agrícolas", category: "maquinaria", subcategory: "Desbrozadoras" },
    { title: "Serviços de Manutenção de quintas", category: "servicios", subcategory: "Mantenimiento de fincas" },
    { title: "Vedações e cercas para quintas", category: "servicios", subcategory: "Cerramientos y vallados" },
    { title: "Construção rural", category: "servicios", subcategory: "Construcción rural" },
    { title: "Serviços de Tosquiadores", category: "servicios", subcategory: "Esquiladores" },
    { title: "Serviços florestais", category: "servicios", subcategory: "Servicios forestales" },
    { title: "Reboques agrícolas usados", category: "maquinaria", subcategory: "Remolques" },
    { title: "Alimentos Km0", category: "alimentos" },
    { title: "Venda de Quintas", category: "fincas", subcategory: "Venta" },
    { title: "Arrendamento de Quintas", category: "fincas", subcategory: "Alquiler" },
    { title: "Trespasse de Explorações", category: "fincas", subcategory: "Traspasos explotaciones" },
];

export const SEO_LANDINGS_PT: SeoLanding[] = rawLandings.map((item) => ({
    ...item,
    slug: slugify(item.title),
    description: (item as any).description || `Descubra os melhores anúncios de ${item.title.toLowerCase()} na Ruralpop. O grande mercado agrícola e ganadeiro de Espanha e Portugal. Se está interessado em comprar ou vender, aqui encontrará o melhor ambiente de compra e venda direta. Encontre as melhores opções verificadas e contacte o vendedor sem intermediários. Atualizado diariamente com classificados de ${item.title.toLowerCase()}.`,
    faqs: [
        {
            question: "Como me registo?",
            answer: "Registe-se grátis e comece a aceder a todas as funcionalidades da Ruralpop. É muito simples, só tem de introduzir o seu email e uma palavra-passe e poderá aceder imediatamente ao mercado da Ruralpop."
        },
        {
            question: "A utilização da Ruralpop tem algum custo?",
            answer: "Nenhum, pode descarregar a app de forma totalmente gratuita, registar-se e, uma vez membro da Ruralpop, pode entrar em contacto com outros agricultores ou criadores para comprar ou vender."
        },
        {
            question: "Como contacto outro utilizador da Ruralpop?",
            answer: "Se estiver interessado em algo que vê, pode contactar o utilizador que publica diretamente a partir do anúncio, através do chat. É totalmente seguro e confidencial. Não terá de fornecer nenhum dado pessoal se não quiser."
        },
        {
            question: "É seguro usar a Ruralpop?",
            answer: "Totalmente seguro. Não tem de facultar nenhum dado pessoal se não o pretender. Ao configurar o seu perfil, apenas introduz o seu nome, email e palavra-passe. Se mais tarde estabelecer contacto com outro membro da comunidade e lhe quiser facultar mais dados através do chat, será uma decisão sua."
        },
        {
            question: `É um profissional ou empresa do setor${item.category === "maquinaria" ? " de maquinaria agrícola" : ""}?`,
            answer: "Para si, como profissional, temos diferentes espaços para oferecer os seus produtos e serviços aos agricultores. Obterá a visibilidade que necessita no melhor lugar."
        },
        {
            question: `Como encontrar os melhores anúncios de ${item.title.toLowerCase()}?`,
            answer: `Na Ruralpop usamos um sistema de classificação que mostra os anúncios mais recentes e destacados de ${item.title.toLowerCase()}. Pode usar os filtros superiores para ajustar o preço ou a localização exata.`
        },
    ]
}));
