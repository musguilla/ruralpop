const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_BIGINT = BigInt(62);

/**
 * Encodes a 36-character UUID (with hyphens) into a smaller Base62 string (approx 22 chars).
 * Safe for URL paths.
 */
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

/**
 * Validates if a string is a properly formatted UUID.
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Decodes a Base62 string back into its original 36-character UUID format (with hyphens).
 * Returns null if the resulting ID is not a valid UUID, to prevent database casting errors.
 */
export function decodeId(shortId: string): string | null {
    if (!shortId || typeof shortId !== 'string') return null;
    try {
        // If it looks like a standard UUID, return it directly
        if (shortId.length === 36 && shortId.includes('-')) {
            return isValidUUID(shortId) ? shortId : null;
        }

        let num = BigInt(0);
        for (let i = 0; i < shortId.length; i++) {
            const char = shortId[i];
            const val = BASE62_CHARS.indexOf(char);
            if (val === -1) throw new Error("Invalid base62 character");
            num = num * BASE62_BIGINT + BigInt(val);
        }

        let hex = num.toString(16).padStart(32, "0");
        const uuid = [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20)
        ].join("-");
        
        return isValidUUID(uuid) ? uuid : null;
    } catch (e) {
        console.error("Error decoding Base62 to UUID:", e);
        return null; // Safe fallback
    }
}

/**
 * Memory / Decisiones Técnicas:
 * - Reducimos el tamaño de la URL al codificar en Base62 el UUID (de 36 a ~22 caracteres).
 * - Usamos BigInt de JS estándar (disponible en entornos modernos / Node > 10.4).
 * - Manejo robusto de errores con retorno fallback.
 */
