'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function AdSenseGalleryBottom() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Error cargando AdSense Gallery Bottom:', err);
        }
    }, []);

    return (
        <div className="w-full flex justify-center mt-2 mb-4 overflow-hidden">
            <style>
                {`
                .ad-gallery-bottom { display: inline-block; width: 320px; height: 100px; }
                @media(min-width: 768px) { .ad-gallery-bottom { width: 728px; height: 90px; } }
                `}
            </style>
            <Script
                id={`adsense-gallery-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle ad-gallery-bottom"
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="1497028078"
            />
        </div>
    );
}
