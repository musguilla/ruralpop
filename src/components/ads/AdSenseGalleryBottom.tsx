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
        <div className="w-full mt-2 mb-4 overflow-hidden block">
            <Script
                id={`adsense-gallery-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="1497028078"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}
