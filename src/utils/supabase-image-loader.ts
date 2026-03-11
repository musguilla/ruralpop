export default function supabaseLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    // TEMPORAL REF: fallback to standard URL until Supabase Pro Image Transformations are confirmed enabled
    return src || '';
}
