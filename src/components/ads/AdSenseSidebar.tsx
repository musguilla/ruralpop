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
        <div className="w-full mt-6 overflow-hidden block text-center">
            <style>
                {`
                .ad-sidebar { display: inline-block; width: 300px; height: 600px; }
                @media(min-width: 768px) { .ad-sidebar { width: 360px; height: 800px; } }
                `}
            </style>
            <Script
                id={`adsense-sidebar-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle ad-sidebar"
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="2259220062"
            />
        </div>
    );
}
