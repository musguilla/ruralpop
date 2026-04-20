'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function AdSenseSidebar() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Error cargando AdSense:', err);
        }
    }, []);

    return (
        <div className="w-full flex justify-center mt-6 overflow-hidden">
            <Script
                id="adsense-script"
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '360px', height: '800px' }}
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="1649071318"
            />
        </div>
    );
}
