/**
 * Definición estándar del objeto de medios mixtos
 * Guardado en la columna 'media' de las bases de datos.
 */
export interface MediaObject {
    storage_provider: 'supabase' | 'r2';
    storage_path: string;
    public_url?: string;
    mime_type?: string;
    size_bytes?: number;
}

/**
 * Obtiene la URL pública procesada y segura de la imagen,
 * abstrayendo si se guardó pre-migración (string simple de Supabase) 
 * o post-migración (objeto JSON dual-provider).
 * 
 * @param image string (legacy) | MediaObject (nuevo) | null
 * @returns string 
 */
export function getImageUrl(image: string | MediaObject | null | undefined): string {
    // 1. Fallback seguro por si viene mal
    if (!image) {
        return '/placeholder-image.jpg'; // O la ruta a un logo por defecto de Ruralpop
    }

    // 2. Si es una migración Legacy (texto plano apuntando a supabase)
    if (typeof image === 'string') {
        return image;
    }

    // 3. Sistema dinámico Moderno (Object JSON)
    const { storage_provider, storage_path, public_url } = image;

    // Si guardaron de antemano la public_url literal, le damos maxima prioridad.
    if (public_url) return public_url;

    // Redirección R2
    if (storage_provider === 'r2') {
        const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL;

        if (!r2BaseUrl) {
            console.warn("⚠️ Falta NEXT_PUBLIC_R2_URL en el entorno");
            // Fallback en caso radical de que falte env temporalmente
            return `https://pub-d5e9ba1c275e41eb8458dc0c7fe5f525.r2.dev/${storage_path}`; 
        }

        // Limpiar duplicaciones de barras dobles, p.ej. url//path
        const cleanBase = r2BaseUrl.replace(/\/+$/, '');
        const cleanPath = storage_path.replace(/^\/+/, '');
        
        return `${cleanBase}/${cleanPath}`;
    }

    // Redirección directa originada desde storage_path Supabase viejo en objeto json
    if (storage_provider === 'supabase') {
        const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        // Asumiendo que storage path guarda la subruta "listings/xx"
        // Si no la guarda y guarda completa también saltaría por arriba, pero protegemos aquí:
        if(storage_path.startsWith('http')) return storage_path;
        return `${supabaseBase}/storage/v1/object/public/${storage_path}`;
    }

    // Fallback absoluto
    return '/placeholder-image.jpg';
}
