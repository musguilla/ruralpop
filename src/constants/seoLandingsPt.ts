import { slugify } from "@/utils/seoUtils";

export interface SeoLanding {
    title: string;
    slug: string;
    subtitle?: string;
    category?: string;
    subcategory?: string;
    province?: string;
    searchQuery?: string;
    customUrl?: string;
    description: string;
    faqs: { question: string; answer: string }[];
}

const rawLandings = [
    { title: "Venda de animais de fazenda", category: "ganaderia" },
    { title: "Venda de animais em Lisboa", category: "ganaderia", province: "Lisboa" },
    { title: "Venda de animais no Porto", category: "ganaderia", province: "Porto" },
    { title: "Compra e venda de gado", category: "ganaderia" },
    { title: "Compra e venda de gado em Santarém", category: "ganaderia", province: "Santarém" },
    { title: "Compra e venda de gado em Évora", category: "ganaderia", province: "Évora" },
    { title: "Pecuária em Beja", category: "ganaderia", province: "Beja" },
    { title: "Pecuária em Braga", category: "ganaderia", province: "Braga" }, 
    { title: "Pecuária em Coimbra", category: "ganaderia", province: "Coimbra" },
    { title: "Pecuária em Viseu", category: "ganaderia", province: "Viseu" },
    { title: "Pecuária em Castelo Branco", category: "ganaderia", province: "Castelo Branco" },
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
    { title: "Gado para venda em Faro", category: "ganaderia", province: "Faro" },
    { title: "Gado para venda em Leiria", category: "ganaderia", province: "Leiria" },
    { title: "Gado para venda em Vila Real", category: "ganaderia", province: "Vila Real" },
    { title: "Gado para venda em Viana do Castelo", category: "ganaderia", province: "Viana do Castelo" },
    { title: "Gado para venda em Bragança", category: "ganaderia", province: "Bragança" },
    { title: "Comprar gado em Portalegre", category: "ganaderia", province: "Portalegre" },
    { title: "Comprar gado na Guarda", category: "ganaderia", province: "Guarda" },
    { title: "Comprar gado em Aveiro", category: "ganaderia", province: "Aveiro" },
    { title: "Comprar gado em Setúbal", category: "ganaderia", province: "Setúbal" },
    { title: "Tratores em segunda mão em Santarém", category: "maquinaria", province: "Santarém", searchQuery: "tractor" },
    { title: "Tratores em segunda mão no Porto", category: "maquinaria", province: "Porto", searchQuery: "tractor" },
    { title: "Tratores usados em Lisboa", category: "maquinaria", province: "Lisboa", searchQuery: "tractor" },
    { title: "Trator em segunda mão em Braga", category: "maquinaria", province: "Braga", searchQuery: "tractor" },
    { title: "Trator usado em Coimbra", category: "maquinaria", province: "Coimbra", searchQuery: "tractor" },
    
    // --- NUEVAS CATEGORIAS HARDCODEADAS PARA SEO ---
    { title: "Quintas rústicas", category: "fincas", description: "Encontre quintas rústicas, terrenos e parcelas agrícolas para venda e arrendamento." },
    { title: "Quintas no Alentejo", category: "fincas", province: "Évora" },
    { title: "Vitela", category: "ganaderia", subcategory: "Bovino", customUrl: "/pt/pecuaria/bovinos/vitela" },
    { title: "Material de Apicultura", category: "ganaderia", subcategory: "Apicultura" },
    { title: "Ceifeiras-debulhadoras em segunda mão", category: "maquinaria", subcategory: "Cosechadoras" },
    { title: "Gadanheiras de ocasião", category: "maquinaria", subcategory: "Segadoras" },
    { title: "Roçadoras florestais e agrícolas", category: "maquinaria", subcategory: "Desbrozadoras" },
    { title: "Serviços de Manutenção de quintas", category: "servicios", subcategory: "Mantenimiento de fincas" },
    { title: "Vedações e cercas para quintas", category: "servicios", subcategory: "Cerramientos y vallados" },
    { title: "Cordeiros", category: "ganaderia", subcategory: "Ovino", customUrl: "/pt/pecuaria/ovinos/cordeiros" },
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
    description: (item as any).description || `Descubra os melhores anúncios de ${item.title.toLowerCase()} na Ruralpop. O grande mercado agrícola e pecuário de Portugal. Se está interessado em comprar ou vender, aqui encontrará o melhor ambiente de compra e venda direta. Encontre as melhores opções verificadas e contacte o vendedor sem intermediários. Atualizado diariamente com classificados de ${item.title.toLowerCase()}.`,
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
