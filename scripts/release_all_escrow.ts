import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripeRuralpop = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const stripeEquipop = new Stripe(process.env.STRIPE_SECRET_KEY_EQUIPOP!, { apiVersion: '2023-10-16' });

function getStripe(tenant_id: string | null) {
    if (tenant_id === 'equipop') return stripeEquipop;
    return stripeRuralpop;
}

async function run() {
    console.log("Fetching stuck escrow orders...");
    const { data: orders, error } = await supabaseAdmin
        .from("escrow_orders")
        .select(`
            id,
            status,
            created_at,
            gross_amount_cents,
            seller_net_amount_cents,
            buyer_id,
            seller_id,
            seller_email,
            stripe_connected_account_id,
            stripe_payment_intent_id,
            stripe_transfer_id,
            listings (
                tenant_id
            ),
            buyer:users!escrow_orders_buyer_id_fkey(name, email),
            seller:users!escrow_orders_seller_id_fkey(name, email)
        `)
        .in("status", ["paid_held", "buyer_confirmed"])
        .is("stripe_transfer_id", null);

    if (error) {
        console.error("Error fetching orders:", error);
        return;
    }

    console.log(`Found ${orders.length} pending orders.`);
    
    let releasedCount = 0;
    const details = [];

    for (const order of orders) {
        console.log(`Processing order ${order.id} (${order.gross_amount_cents / 100}€)...`);
        
        try {
            const stripe = getStripe(order.listings?.tenant_id);

            // 1. Mark as buyer_confirmed if not already
            if (order.status !== "buyer_confirmed") {
                await supabaseAdmin
                    .from("escrow_orders")
                    .update({ 
                        status: "buyer_confirmed", 
                        buyer_confirmed_at: new Date().toISOString() 
                    })
                    .eq("id", order.id);
            }

            // 2. Perform Stripe Transfer
            const transfer = await stripe.transfers.create({
                amount: order.seller_net_amount_cents,
                currency: "eur",
                destination: order.stripe_connected_account_id,
                transfer_group: `escrow_${order.id}`,
                metadata: {
                    escrow_order_id: order.id
                }
            });

            // 3. Update DB
            await supabaseAdmin
                .from("escrow_orders")
                .update({
                    status: "paid_out",
                    stripe_transfer_id: transfer.id,
                    seller_paid_at: new Date().toISOString()
                })
                .eq("id", order.id);

            // 4. Update wallet
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
                        description: `Pago liberado manualmente por administrador`,
                    });
            }

            releasedCount++;
            
            const buyerName = order.buyer?.name || order.buyer?.email || order.buyer_id;
            const sellerName = order.seller?.name || order.seller?.email || order.seller_id;
            
            details.push(`- **${order.seller_net_amount_cents / 100}€** de comprador **${buyerName}** a vendedor **${sellerName}** (Pedido: ${order.id.split('-')[0]})`);
            console.log(`✅ Success`);

        } catch (err: any) {
            console.error(`❌ Failed for order ${order.id}:`, err.message);
        }
    }

    console.log(`\n\n=== REPORTE FINAL ===`);
    console.log(`Liberados: ${releasedCount} de ${orders.length}`);
    console.log(details.join('\n'));
}

run();
