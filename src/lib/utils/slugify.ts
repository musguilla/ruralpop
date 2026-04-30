export function slugify(text: string): string {
    if (!text) return '';
    return text.toString().toLowerCase()
        .normalize('NFD')                   // Decompose combined graphemes into the combination of simple ones
        .replace(/[\u0300-\u036f]/g, '')   // Remove diacritics
        .replace(/\s+/g, '-')              // Replace spaces with -
        .replace(/[^\w\-]+/g, '')          // Remove all non-word chars
        .replace(/\-\-+/g, '-')            // Replace multiple - with single -
        .replace(/^-+/, '')                // Trim - from start of text
        .replace(/-+$/, '');               // Trim - from end of text
}
