import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
    const listingId = "7QcL0oOxVBOK1m0iXTYhoj";
    
    // Simulate what escrow.ts does:
    const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select(`
            *,
            users (*)
        `)
        .ilike("title", "%semillas%")
        .limit(1)
        .single();

    if (listingError) {
        console.log("Listing Error:", listingError);
        return;
    }

    console.log("Seller object (listing.users):", listing.users);
    
    const seller = listing.users;
    if (!seller) {
        console.log("NO SELLER OBJECT FOUND IN LISTING.USERS!");
        return;
    }

    const { data: wallet, error: walletError } = await supabase
        .from("professional_wallets")
        .select("stripe_connected_account_id")
        .eq("user_id", seller.id)
        .single();

    console.log("Wallet fetch result:", { wallet, walletError });
}

debug();
