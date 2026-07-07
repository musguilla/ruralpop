require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

async function run() {
  const slugs = [
    "montura-7kvxbyAYh1fIwbcRut1ms3",
    "se-vende-2qbvkpFOh99IorKQ3TaXr",
    "cincha-western-2FP0kxeLGamg1r0lRCt8La",
    "montura-zaldi-alta-escuela-5swWlQ0wg2zFNBECmcctHs"
  ];

  for (const slug of slugs) {
      const parts = slug.split('-');
      const shortId = parts[parts.length - 1];
      const uuid = decodeId(shortId);
      
      console.log(`\nProcessing ${slug}`);
      if (!uuid) {
          console.log(`Failed to decode UUID from ${shortId}`);
          continue;
      }
      
      console.log(`Decoded UUID: ${uuid}`);
      const { data: item } = await supabaseAdmin.from('listings').select('title, shared_to_equipop').eq('id', uuid).single();
      if (!item) {
          console.log(`Item not found in database.`);
          continue;
      }
      
      console.log(`Found: ${item.title}`);
      console.log(`Unsharing...`);
      const { error } = await supabaseAdmin.from('listings').update({ shared_to_equipop: false }).eq('id', uuid);
      if (error) {
          console.log("Error:", error);
      } else {
          console.log("Success!");
      }
  }
}

run();
