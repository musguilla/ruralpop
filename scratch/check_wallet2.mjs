import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Stripe from 'stripe';

const envFile = fs.readFileSync('.env.local', 'utf8');
const matchUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const matchKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const matchStripe = envFile.match(/STRIPE_SECRET_KEY=(.*)/);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || matchUrl?.[1];
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || matchKey?.[1];
const stripeKey = process.env.STRIPE_SECRET_KEY || matchStripe?.[1];

const supabase = createClient(url, key);
const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' });

async function main() {
    const userId = 'd00781f5-7b0b-4d41-9c2e-0b2610ef4160';
    const { data: wallet } = await supabase.from('professional_wallets').select('*').eq('user_id', userId).single();
    
    if (wallet?.stripe_connected_account_id) {
        try {
            const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
            console.log("STRIPE ACCOUNT:", {
                id: account.id,
                email: account.email,
                charges_enabled: account.charges_enabled,
                details_submitted: account.details_submitted
            });
        } catch (e) {
            console.error("STRIPE ERROR:", e.message);
        }
    } else {
        console.log("NO WALLET FOUND IN DB");
    }
}
main();
