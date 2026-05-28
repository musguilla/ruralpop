const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const bs58 = require('bs58'); // Ruralpop usa base58 habitualmente, o sqids, o hashids, voy a intentar ver qué usa cargando la app.
