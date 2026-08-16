require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

async function main() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, secretKey);

    const stripeKey = process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeKey);

    const orderId = "dbe67d74-6790-4bca-9980-1faea0f6b254";

    console.log(`=== Processing Refund for Order ${orderId} ===`);

    const { data: order, error: fetchErr } = await supabaseAdmin
        .from('escrow_orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchErr || !order) {
        console.error("Order fetch error:", fetchErr);
        return;
    }

    console.log("Order found:", {
        id: order.id,
        payment_intent: order.stripe_payment_intent_id,
        status: order.status,
        gross_cents: order.gross_amount_cents,
        seller_id: order.seller_id
    });

    console.log("\n=== 1. Creating Stripe Refund with Reverse Transfer ===");
    try {
        const refund = await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent_id,
            reverse_transfer: true,
            metadata: {
                escrow_order_id: order.id,
                reason: "Buyer cancelled - seller did not ship"
            }
        });

        console.log("Stripe Refund Success!");
        console.log("Refund ID:", refund.id);
        console.log("Status:", refund.status);
        console.log("Amount:", refund.amount / 100, "EUR");
    } catch (refundErr) {
        console.error("Stripe refund error:", refundErr.message);
        // If reverse_transfer fails because transfer was already created or needs transfer_reversal, let's try direct refund or transfer reversal
        if (refundErr.message.includes("transfer")) {
            console.log("Attempting fallback refund without reverse_transfer...");
            const fallbackRefund = await stripe.refunds.create({
                payment_intent: order.stripe_payment_intent_id,
                metadata: { escrow_order_id: order.id }
            });
            console.log("Fallback Refund Success! Refund ID:", fallbackRefund.id);
        } else {
            return;
        }
    }

    console.log("\n=== 2. Updating DB Escrow Order Status to 'refunded' ===");
    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
        .from('escrow_orders')
        .update({
            status: 'refunded',
            refunded_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

    if (updateErr) {
        console.error("DB Update error:", updateErr);
    } else {
        console.log("DB Order updated to refunded:", updatedOrder);
    }

    console.log("\n=== 3. Updating Professional Wallet & Recording Transaction ===");
    const { data: wallet } = await supabaseAdmin
        .from('professional_wallets')
        .select('*')
        .eq('user_id', order.seller_id)
        .maybeSingle();

    if (wallet) {
        await supabaseAdmin
            .from('wallet_transactions')
            .insert({
                wallet_id: wallet.id,
                escrow_order_id: order.id,
                type: 'refund_processed',
                amount_cents: -order.seller_net_amount_cents,
                description: 'Devolución al comprador por falta de envío'
            });
        console.log("Wallet transaction recorded.");
    }
}

main();
