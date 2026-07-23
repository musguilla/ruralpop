import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdSenseInFeed } from '@/components/ads/AdSenseInFeed';

export function HomeAdBanners() {
    return (
        <section className="mt-8 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                
                {/* Banner 1: Cunimar */}
                <Link 
                    href="https://cunimar.com/comida-y-productos-secos-conejos/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--ag-sys-color-border)]"
                >
                    <Image 
                        src="/cunimar-banner-800x800@2x.jpg" 
                        alt="Cunimar - Comida y productos secos para conejos"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </Link>

                {/* Banner 2: Mas del Brunet */}
                <Link 
                    href="https://masdelbrunet.cat/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--ag-sys-color-border)]"
                >
                    <Image 
                        src="/masdelbrunet-banner-800x800.jpg" 
                        alt="Mas del Brunet"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </Link>

                {/* Banner 3: Semillas */}
                <Link 
                    href="https://www.ruralpop.com/empresa/semillas" 
                    className="block relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-[var(--ag-sys-color-border)]"
                >
                    <Image 
                        src="/semillass-banner-800x800.jpg" 
                        alt="Semillas"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </Link>

                {/* Banner 4: Google Adsense */}
                <div className="block relative aspect-square">
                    <AdSenseInFeed />
                </div>

            </div>
        </section>
    );
}
