'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function AdSenseDisplaySidebar() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('Error cargando AdSense Display Sidebar:', err);
        }
    }, []);

    // Evitamos renderizar el ins directamente en SSR para prevenir CLS si no carga, 
    // pero como el layout lo manejamos en el wrapper principal, podemos pintarlo directamente.
    return (
        <div className="w-full min-h-[600px] block text-center">
            <Script
                id={`adsense-display-sidebar-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-2042067618462129"
                data-ad-slot="5164598314"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}
