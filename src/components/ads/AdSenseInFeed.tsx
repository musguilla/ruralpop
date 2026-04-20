'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function AdSenseInFeed() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Error cargando AdSense InFeed:', err);
        }
    }, []);

    return (
        <div className="flex flex-col bg-[var(--ag-sys-color-surface)] rounded-2xl border border-[var(--ag-sys-color-border)] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden w-full h-full relative p-0">
            <Script
                id={`adsense-infeed-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-[var(--ag-sys-color-background)]">
                <ins
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-format="fluid"
                    data-ad-layout-key="-6s+ed+2g-1n-4q"
                    data-ad-client="ca-pub-2042067618462129"
                    data-ad-slot="8162508770"
                />
            </div>
        </div>
    );
}
