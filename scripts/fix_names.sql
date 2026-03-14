const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// We need postgres client to execute arbitrary SQL or we can just send the SQL file to user.
// Let's create an SQL file for the user to run in Supabase SQL editor.
