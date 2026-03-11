export default function supabaseLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    const isSupabaseUrl = src.includes('supabase.co/storage/v1/object/public');
    if (isSupabaseUrl) {
        const transformedSrc = src.replace('/object/public', '/render/image/public');
        const url = new URL(transformedSrc);
        url.searchParams.set('width', width.toString());
        url.searchParams.set('quality', (quality || 75).toString());
        url.searchParams.set('format', 'webp'); // Optimized format
        return url.href;
    }
    return src;
}
