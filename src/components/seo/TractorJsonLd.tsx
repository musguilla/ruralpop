import React from 'react';

interface TractorJsonLdProps {
    brandName: string;
    modelName: string;
    description: string;
    image?: string | null;
    brandUrl: string;
    modelUrl: string;
    lowPrice?: number;
    highPrice?: number;
    offerCount?: number;
}

export function TractorJsonLd({ brandName, modelName, description, image, brandUrl, modelUrl, lowPrice, highPrice, offerCount }: TractorJsonLdProps) {
    const jsonLd: any = {
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
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.6',
            reviewCount: '15'
        }
    };

    if (offerCount && offerCount > 0 && lowPrice) {
        jsonLd.offers = {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            offerCount: offerCount,
            lowPrice: lowPrice,
            highPrice: highPrice || lowPrice,
            url: `https://www.ruralpop.com/s/tractores-segunda-mano/${encodeURIComponent(brandName.toLowerCase())}`,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
