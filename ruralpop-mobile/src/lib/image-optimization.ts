// Helper to generate Supabase Image Transformation URLs

/**
 * Convierte la URL pública original de Supabase (bucket `listings`)
 * en una URL de transformación On-the-fly (`/render/image/public/listings/...`)
 * aplicando redimensionamiento y WebP de forma unificada para la app móvil.
 * 
 * Si la url no es de nuestro Supabase, la devuelve intacta (ej, avatares externos).
 */
export function getOptimizedImageUrl(
    originalUrl: string | null | undefined,
    options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' } = {}
): string | null {
    if (!originalUrl) return null;

    // Si no es una URL de supabase o no es del bucket 'listings', la servimos tal cual.
    if (!originalUrl.includes('.supabase.co/storage/v1/object/public/listings/')) {
        return originalUrl;
    }

    // Ejemplo de originalUrl: 
    // https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/object/public/listings/123-abc.jpg
    // Target format:
    // https://zrpucbuvojskcwrhwevv.supabase.co/storage/v1/render/image/public/listings/123-abc.jpg?width=400&resize=cover&quality=80

    const { width = 400, height, quality = 80, resize = 'cover' } = options;

    // Extraemos la primera parte (host) y la ruta del bucket
    const parts = originalUrl.split('/storage/v1/object/public/listings/');
    if (parts.length !== 2) return originalUrl;

    const baseUrl = parts[0];
    const imagePath = parts[1];

    let transformationUrl = `${baseUrl}/storage/v1/render/image/public/listings/${imagePath}`;

    const queryParams = new URLSearchParams();
    if (width) queryParams.append('width', width.toString());
    if (height) queryParams.append('height', height.toString());
    if (quality) queryParams.append('quality', quality.toString());
    if (resize) queryParams.append('resize', resize);

    // Asegura que sirve formato moderno automático
    queryParams.append('format', 'origin');

    return `${transformationUrl}?${queryParams.toString()}`;
}
