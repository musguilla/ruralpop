import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/luis/Personal/__RURALPOP/ruralpopv1/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62_BIGINT = BigInt(62);

function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

function decodeId(shortId) {
    if (!shortId || typeof shortId !== 'string') return null;
    try {
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
        return null;
    }
}

async function main() {
    const shortIds = ['7lAkSUWLOCjZ1m1QccdfuB', '4yqDlfAjNEkQIOG1kiIeDb'];
    const ids = shortIds.map(decodeId);

    const { data: listings, error } = await supabase
        .from('listings')
        .select(`
            title,
            users ( email )
        `)
        .in('id', ids);

    if (error) {
        console.error("Error fetching listings:", error);
    } else {
        listings.forEach(l => {
            console.log(`Title: ${l.title}`);
            console.log(`Email: ${l.users?.email}`);
            console.log("---");
        });
    }
}

main();
