import type { MetadataRoute } from 'next'
import { getServerTenantSlug } from '@/utils/tenant/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const tenant = await getServerTenantSlug();
    const isEquipop = tenant === 'equipop';

    if (isEquipop) {
        return {
            name: 'Equipop',
            short_name: 'Equipop',
            description: 'El marketplace de compraventa y segunda mano para el mundo ecuestre',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#1E3A8A',
            icons: [
                {
                    src: '/equipop-favicon.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                }
            ],
        };
    }

    return {
        name: 'Ruralpop',
        short_name: 'Ruralpop',
        description: 'El portal de clasificados líder en agricultura y ganadería',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#059669', // Emerald 600
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
    };
}

