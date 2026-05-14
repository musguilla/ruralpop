const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_BIGINT = BigInt(62);

export function encodeId(uuid: string): string {
    if (!uuid || typeof uuid !== 'string') return '';
    try {
        const hex = uuid.replace(/-/g, "");
        let num = BigInt("0x" + hex);
        let encoded = "";
        if (num === BigInt(0)) return "0";
        while (num > BigInt(0)) {
            const rem = Number(num % BASE62_BIGINT);
            encoded = BASE62_CHARS[rem] + encoded;
            num = num / BASE62_BIGINT;
        }
        return encoded;
    } catch (e) {
        console.error("Error encoding UUID to Base62:", e);
        return uuid; // Fallback
    }
}

export function slugify(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function buildWebListingUrl(id: string, title: string): string {
    const slug = slugify(title);
    const shortId = encodeId(id);
    return `https://www.ruralpop.com/anuncio/${slug}-${shortId}`;
}
