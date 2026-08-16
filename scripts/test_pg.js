try {
    const pg = require('pg');
    console.log("pg is installed!");
} catch (e) {
    console.log("pg not installed:", e.message);
}

try {
    const postgres = require('postgres');
    console.log("postgres is installed!");
} catch (e) {
    console.log("postgres not installed:", e.message);
}
