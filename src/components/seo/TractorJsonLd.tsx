import React from 'react';

interface TractorJsonLdProps {
    brandName: string;
    modelName: string;
    description: string;
    image?: string | null;
    brandUrl: string;
    modelUrl: string;
}

export function TractorJsonLd({ brandName, modelName, description, image, brandUrl, modelUrl }: TractorJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `Tractor ${brandName} ${modelName}`,
        image: image || undefined,
        description: description,
        brand: {
            '@type': 'Brand',
            name: brandName,
            url: brandUrl,
        },
        category: 'Tractor',
        url: modelUrl,
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            offerCount: 1, // Represents "We have second-hand listings" conceptually
            url: `https://www.ruralpop.com/s/tractores-segunda-mano/${encodeURIComponent(brandName.toLowerCase())}`,
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
