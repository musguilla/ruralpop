require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, adminKey);
    
    const stripeKey = process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeKey);

    const orderId = "658afeff-ceb4-483a-868f-04dd1785bcaa";
    
    console.log(`=== Fixing Order ${orderId} (Veredus Olympus - 60€) ===`);
    
    const { data: order } = await supabaseAdmin
        .from('escrow_orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
    if (!order) {
        console.error("Order not found!");
        return;
    }

    if (order.status === "paid_out") {
        console.log("Order is already paid out.");
        return;
    }

    console.log("Current status:", order.status);

    console.log("\n1. Marking as buyer_confirmed in DB...");
    const { error: updateError } = await supabaseAdmin
        .from('escrow_orders')
        .update({
            status: 'buyer_confirmed',
            buyer_confirmed_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (updateError) {
        console.error("Update error:", updateError);
        return;
    }
    
    console.log("DB updated successfully.");

    console.log("\n2. Releasing payout via Stripe...");
    try {
        const transfer = await stripe.transfers.create({
            amount: order.seller_net_amount_cents,
            currency: "eur",
            destination: order.stripe_connected_account_id,
            transfer_group: `escrow_${order.id}`,
            metadata: {
                escrow_order_id: order.id
            }
        });

        console.log("Stripe Transfer created!", transfer.id);
        
        console.log("\n3. Finalizing order to 'paid_out'...");
        await supabaseAdmin
            .from("escrow_orders")
            .update({
                status: "paid_out",
                stripe_transfer_id: transfer.id,
                seller_paid_at: new Date().toISOString()
            })
            .eq("id", order.id);

        const { data: wallet } = await supabaseAdmin
            .from("professional_wallets")
            .select("id, pending_balance_cents, available_balance_cents, total_earned_cents")
            .eq("user_id", order.seller_id)
            .single();

        if (wallet) {
            await supabaseAdmin
                .from("professional_wallets")
                .update({
                    pending_balance_cents: Math.max(0, wallet.pending_balance_cents - order.seller_net_amount_cents),
                    available_balance_cents: wallet.available_balance_cents + order.seller_net_amount_cents,
                    total_earned_cents: wallet.total_earned_cents + order.seller_net_amount_cents
                })
                .eq("id", wallet.id);

            await supabaseAdmin
                .from("wallet_transactions")
                .insert({
                    wallet_id: wallet.id,
                    escrow_order_id: order.id,
                    type: "payout_released",
                    amount_cents: order.seller_net_amount_cents,
                    description: "Pago liberado por el comprador"
                });
            console.log("Wallet and transactions updated!");
        }

        console.log("FIX COMPLETED SUCCESSFULLY!");
    } catch (e) {
        console.error("Error during payout:", e.message);
    }
}

main();
