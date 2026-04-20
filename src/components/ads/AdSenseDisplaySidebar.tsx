'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function AdSenseDisplaySidebar() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
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
        <div className="w-full min-h-[600px] flex justify-center text-center">
            <Script
                id={`adsense-display-sidebar-${Math.random().toString(36).substring(7)}`}
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2042067618462129"
                crossOrigin="anonymous"
                strategy="lazyOnload"
            />
            {isClient && (
                <ins
                    className="adsbygoogle"
                    style={{ display: 'inline-block', width: '360px', height: '800px' }}
                    data-ad-client="ca-pub-2042067618462129"
                    data-ad-slot="7104365948"
                />
            )}
        </div>
    );
}
