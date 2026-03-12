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
    // Desactivamos temporalmente las transformaciones de Supabase
    // hasta confirmar que el proyecto tiene activo el plan Pro/Pay-as-you-go.
    // Esto evita que las imágenes aparezcan en blanco en la app.
    return originalUrl || null;
}
