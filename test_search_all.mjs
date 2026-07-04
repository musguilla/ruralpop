import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const email = 'pirispijo@hotmail.com';
    console.log("Searching everything for:", email);

    // 1. Search in profiles by any text matching
    const { data: users } = await supabase.from('users').select('*').or(`email.ilike.%pirispijo%,name.ilike.%pirispijo%`);
    console.log("Users:", users);

    // 2. Search in wallet_transactions for metadata
    const { data: wt } = await supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(20);
    const wtMatches = wt?.filter(t => JSON.stringify(t).includes('pirispijo')) || [];
    console.log("Wallet Transactions Matches:", wtMatches);
    if (wt && wt.length > 0) {
      console.log("Recent WT:", wt.slice(0,2));
    }

    // 3. Check escrow_transactions
    const { data: et } = await supabase.from('escrow_transactions').select('*').order('created_at', { ascending: false }).limit(20);
    const etMatches = et?.filter(t => JSON.stringify(t).includes('pirispijo')) || [];
    console.log("Escrow Transactions Matches:", etMatches);
    
    // 4. Check subscriptions
    const { data: sub } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(20);
    const subMatches = sub?.filter(t => JSON.stringify(t).includes('pirispijo')) || [];
    console.log("Subscriptions Matches:", subMatches);

    // 5. Check auth logs or just raw recent auth users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const aUserMatches = authUsers?.users?.filter(u => JSON.stringify(u).includes('pirispijo'));
    console.log("Auth Users Matches:", aUserMatches);

}
check();
