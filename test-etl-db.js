require('dotenv').config({ path: '.env.local' });
require('tsconfig-paths/register');
const { createClient } = require('@supabase/supabase-js');
const { MarketETLService } = require('./src/lib/services/etl/MarketETLService.ts');
// wait, requiring a TS file directly won't work in node unless we use ts-node
