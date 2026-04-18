// Helper to generate Supabase Image Transformation URLs

/**
 * Convierte la URL pública original de Supabase (bucket `listings`)
 * en una URL de transformación On-the-fly (`/render/image/public/listings/...`)
 * aplicando redimensionamiento y WebP de forma unificada para la app móvil.
 * 
 * Si la url no es de nuestro Supabase, la devuelve intacta (ej, avatares externos).
 */
import { supabase } from './supabase';

export function getOptimizedImageUrl(
    image: string | any | null | undefined,
    options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' } = {}
): string | null {
    if (!image) return null;

    // Supabase Base
    const supabaseBase = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
    const r2BaseUrl = process.env.EXPO_PUBLIC_R2_URL || 'https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev';

    // 1. Array of strings (from Supabase queries)
    if (Array.isArray(image)) {
        image = image[0];
        if (!image) return null;
    }

    // 2. URL Completa o String antiguo de Supabase
    if (typeof image === 'string') {
        if (image.startsWith('http')) {
            return image;
        }
        
        // Es un path relativo de Supabase legacy
        // Hay que distinguir listings y avatars dependiendo del contexto si es posible,
        // pero por defecto en móvil, los avatars (en db) guardaron una vez el nombre `ID/avatar.jpg`.
        // Comprobemos si incluye un uuid para un avatar (formato uuid/avatar.jpg)
        if (image.includes('/') && image.split('/')[0].length >= 32) {
            return `${supabaseBase}/storage/v1/object/public/users/${image.replace(/^\/+/, '')}`;
        }
        
        // Si no, asume listings legacy
        return `${supabaseBase}/storage/v1/object/public/listings/${image.replace(/^\/+/, '')}`;
    }

    // 3. Objeto Media (Por si en el futuro migran a JSON como en web)
    const { storage_provider, storage_path, public_url } = image;
    if (public_url) return public_url;

    if (storage_provider === 'r2') {
        const cleanBase = r2BaseUrl.replace(/\/+$/, '');
        const cleanPath = storage_path?.replace(/^\/+/, '') || '';
        return `${cleanBase}/${cleanPath}`;
    }

    if (storage_provider === 'supabase') {
        if (storage_path?.startsWith('http')) return storage_path;
        return `${supabaseBase}/storage/v1/object/public/${storage_path}`;
    }

    return null;
}

