import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
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
    }
}
