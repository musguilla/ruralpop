import { headers } from 'next/headers';
import React from 'react';
import { getServerTenantSlug } from "@/utils/tenant/server";
import { getLocalizedCategoryName, getLocalizedFaqLocationText } from '@/utils/seoBlockLocalization';

interface FaqProps {
    categoryQuery: string;
    provinceName?: string;
}

export async function DynamicFaqs({ categoryQuery, provinceName }: FaqProps) {
    const headersList = await headers();
    const locale = headersList.get("x-locale") || "es";
    const isPt = locale === "pt";

    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';
    
    const locText = getLocalizedFaqLocationText(provinceName, locale);
    const category = getLocalizedCategoryName(categoryQuery, locale).toLowerCase();

    const brand = isEquipop ? 'Equipop' : 'Ruralpop';
    const sellersText = isPt
        ? (isEquipop ? 'cavaleiros e lojas hípicas' : 'vendedores e criadores de gado')
        : (isEquipop ? 'jinetes y tiendas hípicas' : 'vendedores y ganaderos');

    const sellersText2 = isPt
        ? (isEquipop ? 'particulares a renovar equipamento até courelarias' : 'particulares a liquidar alfaias até criadores profissionais')
        : (isEquipop ? 'particulares que renuevan material hasta guarnicionerías' : 'particulares que liquidan maquinaria hasta criadores profesionales');

    const heading = isPt ? "Perguntas frequentes" : "Preguntas frecuentes";

    const generatedFaqs = isPt ? [
        {
            question: `Onde posso comprar ${category}${locText}?`,
            answer: `No ${brand} dispomos de listagens atualizadas diretamente por ${sellersText}. Pode comprar ${category}${locText} filtrando a nossa base de dados onde encontrará desde ${sellersText2} com os melhores preços diretos.`
        },
        {
            question: `Qual é o preço médio de ${category}${locText}?`,
            answer: `O preço de ${category} é livre e varia conforme o estado ou o transporte${locText}. Ao negociar sem intermediários na nossa plataforma, consegue habitualmente obter uma poupança significativa em comparação com o mercado tradicional.`
        },
        {
            question: `Como posso contactar os vendedores de ${category}?`,
            answer: `Contamos com um sistema seguro de mensagens internas. Basta escolher o anúncio de ${category} que melhor se ajusta ao seu orçamento e clicar no botão "Enviar mensagem" para falar e acertar os detalhes diretamente com o vendedor.`
        }
    ] : [
        {
            question: `¿Dónde puedo comprar ${category}${locText}?`,
            answer: `En ${brand} disponemos de listados actualizados directamente por ${sellersText}. Puedes comprar ${category}${locText} filtrando nuestra base de datos donde encontrarás desde ${sellersText2} con los mejores precios directos.`
        },
        {
            question: `¿Cuál es el precio medio de ${category}${locText}?`,
            answer: `El precio de ${category} es totalmente libre y varía según el estado o los portes${locText}. Al negociar sin intermediarios en nuestra plataforma, habitualmente puedes encontrar un ahorro significativo comparado con el mercado tradicional.`
        },
        {
            question: `¿Cómo contacto con los vendedores de ${category}?`,
            answer: `Contamos con un sistema de mensajería interna seguro. Simplemente elige el anuncio de ${category} que encaja en tu presupuesto y pulsa el botón "Enviar mensaje" para comunicarte y negociar la logística directa con el vendedor.`
        }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": generatedFaqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="mt-12 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">{heading}</h3>
            <div className="space-y-4">
                {generatedFaqs.map((faq, idx) => (
                    <details
                        key={idx}
                        className="group bg-[var(--ag-sys-color-surface-muted)] rounded-2xl border border-[var(--ag-sys-color-border)] overflow-hidden"
                    >
                        <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-[var(--ag-sys-color-text)] hover:bg-black/5 transition-colors">
                            <span>{faq.question}</span>
                            <span className="transition-transform duration-300 group-open:-rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="p-6 pt-0 text-[var(--ag-sys-color-text-muted)] leading-relaxed">
                            {faq.answer}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}

/**
 * Memory / Decisiones Técnicas:
 * - Preguntas y respuestas generadas dinámicamente con soporte nativo de idioma (ES / PT).
 * - En Portugal (.PT) se traduce el título ("Perguntas frequentes"), las 3 preguntas clave y sus respuestas,
 *   así como el marcado estructurado de JSON-LD Schema.org para mejorar el SEO y los fragmentos enriquecidos en Google PT.
 */
