import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    try {
        const res = await client.query(`
            SELECT tgname, tgenabled, prosrc 
            FROM pg_trigger 
            JOIN pg_proc ON pg_proc.oid = pg_trigger.tgfoid 
            WHERE tgrelid = 'listings'::regclass;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
