require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        await client.query(`ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE;`);
        console.log("Column added!");
    } catch(e) {
        console.log("Error:", e.message);
    } finally {
        await client.end();
    }
}
main();
