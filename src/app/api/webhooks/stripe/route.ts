import { headers } from "next/headers";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Webhook signature verification failed.", errorMessage);
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // Initialize Supabase Admin strictly for webhooks to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { listingId, planId } = paymentIntent.metadata || {};

        console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);

        if (listingId && planId) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let updateData: any = {};

                if (planId === "bump") {
                    updateData = {
                        created_at: new Date().toISOString(), // Bump to top
                    };
                } else if (planId === "highlight_7") {
                    updateData = {
                        is_featured: true,
                        featured_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    };
                } else if (planId === "highlight_20") {
                    updateData = {
                        is_featured: true,
                        featured_until: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                    };
                }

                if (Object.keys(updateData).length > 0) {
                    const { error } = await supabaseAdmin
                        .from("listings")
                        .update(updateData)
                        .eq("id", listingId);

                    if (error) {
                        console.error(`Failed to update listing ${listingId} in DB:`, error.message);
                        return new NextResponse("DB Update Failed", { status: 500 });
                    }

                    console.log(`✅ Successfully fulfilled ${planId} for listing ${listingId}`);
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                console.error("Database Error on Webhook:", err);
                return new NextResponse(`Database Error: ${errorMessage}`, { status: 500 });
            }
        }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === 'active') {
            const userId = subscription.metadata?.userId;
            const priceId = subscription.metadata?.priceId;
            const subscriptionId = subscription.id;

            if (userId && priceId) {
                try {
                    let planType = "free";
                    let bumps = 0;
                    let featured = 0;

                    if (priceId === "price_1TBJ6b6eGJa0K3pVDmyCDPeW") { // Start Plan Price ID
                        planType = "start";
                        bumps = 2;
                    } else if (priceId === "price_1TBJ7M6eGJa0K3pVFfx0h8Fz") { // Pro Plan Price ID
                        planType = "pro";
                        bumps = 6;
                        featured = 2;
                    }

                    const { error } = await supabaseAdmin
                        .from('users')
                        .update({
                            role: 'profesional',
                            plan_type: planType,
                            stripe_subscription_id: subscriptionId,
                            available_bumps: bumps,
                            available_featured: featured,
                            plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Fake 1 month renewal for now
                            is_ghost: false,
                            ghost_token: null
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error(`Failed to update user ${userId} to profesional:`, error.message);
                    } else {
                        console.log(`✅ User ${userId} upgraded to ${planType} plan`);
                    }
                } catch (err: unknown) {
                    console.error("DB Error processing subscription:", err);
                }
            }
        }
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const escrowOrderId = session.metadata?.escrow_order_id;

        if (escrowOrderId) {
            try {
                // Update order status
                const { data: order, error: orderError } = await supabaseAdmin
                    .from("escrow_orders")
                    .update({ 
                        status: "paid_held",
                        stripe_payment_intent_id: session.payment_intent as string
                    })
                    .eq("id", escrowOrderId)
                    .select()
                    .single();

                if (orderError || !order) {
                    console.error("Failed to update escrow order:", orderError);
                } else {
                    // Fetch the wallet
                    const { data: wallet } = await supabaseAdmin
                        .from("professional_wallets")
                        .select("id, pending_balance_cents, total_fees_paid_cents")
                        .eq("user_id", order.seller_id)
                        .single();

                    if (wallet) {
                        // Add to pending balance
                        await supabaseAdmin
                            .from("professional_wallets")
                            .update({
                                pending_balance_cents: wallet.pending_balance_cents + order.seller_net_amount_cents,
                                total_fees_paid_cents: wallet.total_fees_paid_cents + order.ruralpop_fee_cents
                            })
                            .eq("id", wallet.id);

                        // Record transaction for fee paid
                        await supabaseAdmin
                            .from("wallet_transactions")
                            .insert({
                                wallet_id: wallet.id,
                                escrow_order_id: order.id,
                                type: "escrow_paid",
                                amount_cents: order.seller_net_amount_cents,
                                description: `Cobro retenido por anuncio ${order.listing_id}`,
                            });
                    }
                    console.log(`✅ Escrow order ${escrowOrderId} marked as paid_held`);
                }
            } catch (err: unknown) {
                console.error("DB Error processing escrow checkout session:", err);
            }
        }
    }

    if (event.type === "transfer.created") {
        const transfer = event.data.object as Stripe.Transfer;
        const escrowOrderId = transfer.metadata?.escrow_order_id;

        if (escrowOrderId) {
            try {
                // Fetch order to know who is the seller
                const { data: order } = await supabaseAdmin
                    .from("escrow_orders")
                    .select("seller_id, seller_net_amount_cents")
                    .eq("id", escrowOrderId)
                    .single();

                if (order) {
                    const { data: wallet } = await supabaseAdmin
                        .from("professional_wallets")
                        .select("id, pending_balance_cents, available_balance_cents, total_earned_cents")
                        .eq("user_id", order.seller_id)
                        .single();

                    if (wallet) {
                        // NOTE: We now eagerly update professional_wallets in `releaseEscrowPayout` directly 
                        // so that the UI updates instantly. Doing it here too would cause double counting.
                        console.log(`✅ Escrow payout webhook received for order ${escrowOrderId} (wallet updated eagerly)`);
                    }
                }
            } catch (err: unknown) {
                console.error("DB Error processing transfer:", err);
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
