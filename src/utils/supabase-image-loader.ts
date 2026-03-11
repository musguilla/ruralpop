export default function supabaseLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    try {
        if (!src || typeof src !== 'string') return src || '';
        const isSupabaseUrl = src.includes('supabase.co/storage/v1/object/public');
        if (isSupabaseUrl) {
            let transformedSrc = src.replace('/object/public', '/render/image/public');
            if (transformedSrc.startsWith('supabase.co')) {
                transformedSrc = 'https://' + transformedSrc;
            }
            const url = new URL(transformedSrc);
            url.searchParams.set('width', width.toString());
            url.searchParams.set('quality', (quality || 75).toString());
            url.searchParams.set('format', 'webp'); // Optimized format
            return url.href;
        }
    } catch (e) {
        console.error('SupabaseLoader error:', e);
    }
    return src || '';
}
