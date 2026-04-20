import React from 'react';

interface FaqProps {
    categoryQuery: string;
    provinceName?: string;
}

export function DynamicFaqs({ categoryQuery, provinceName }: FaqProps) {
    const locText = provinceName ? ` en ${provinceName}` : '';
    const category = categoryQuery.toLowerCase();
    
    // Capitalize category safely
    const cTitle = category.charAt(0).toUpperCase() + category.slice(1);

    const generatedFaqs = [
        {
            question: `¿Dónde puedo comprar ${category}${locText}?`,
            answer: `En Ruralpop disponemos de listados actualizados directamente por vendedores y ganaderos. Puedes comprar ${category}${locText} filtrando nuestra base de datos donde encontrarás desde particulares que liquidan maquinaria hasta criadores profesionales con los mejores precios directos.`
        },
        {
            question: `¿Cuál es el precio medio de ${category}${locText}?`,
            answer: `El precio de ${category} es totalmente libre y varía según el estado, la edad o los portes${locText}. Al negociar sin intermediarios en nuestra plataforma, habitualmente puedes encontrar un ahorro significativo comparado con tratantes comerciales estándar.`
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
            <h3 className="text-xl font-extrabold text-[var(--ag-sys-color-text)] mb-8">Preguntas frecuentes</h3>
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
