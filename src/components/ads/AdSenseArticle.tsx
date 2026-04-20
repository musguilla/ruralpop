'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function AdSenseArticle() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Error cargando AdSense Article:', err);
        }
    }, []);

    return (
        <div className="w-full my-8 overflow-hidden block">
            <Script
                id="adsense-script-article"
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center', width: '100%' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="6964977170"
            />
        </div>
    );
}
