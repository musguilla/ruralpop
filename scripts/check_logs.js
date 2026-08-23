require('dotenv').config({ path: '.env.local' });
// Try to fetch some recent errors from standard supabase error tables or anything we can find
console.log("Can't directly fetch pg_stat_statements without DB URL, checking if we have it in .env...");
console.log(process.env.DATABASE_URL ? "Has DATABASE_URL" : "No DATABASE_URL");
