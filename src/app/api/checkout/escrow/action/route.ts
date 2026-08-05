import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import { releaseEscrowPayout } from "@/lib/services/escrow";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized - Missing Token", { status: 401 });
        }
        const token = authHeader.split(" ")[1];

        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await req.json();
        const { action, orderId } = body;

        if (!action || !orderId) {
            return new NextResponse("Missing action or orderId", { status: 400 });
        }

        // Fetch the order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("escrow_orders")
            .select("*, listings(tenant_id)")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        switch (action) {
            case 'confirm_reception': {
                if (order.buyer_id !== user.id) return new NextResponse("Unauthorized", { status: 403 });
                
                // Idempotency: If already confirmed, just return success instead of an error
                if (order.status === "buyer_confirmed" || order.status === "paid_out") {
                    return NextResponse.json({ success: true, message: "Order was already confirmed" });
                }

                if (order.status !== "paid_held" && order.status !== "awaiting_delivery") {
                    return new NextResponse("Order cannot be confirmed at this stage", { status: 400 });
                }

                const { error: updateError } = await supabaseAdmin
                    .from("escrow_orders")
                    .update({ 
                        status: "buyer_confirmed", 
                        buyer_confirmed_at: new Date().toISOString() 
                    })
                    .eq("id", orderId);

                if (updateError) throw new Error("Failed to confirm order");

                await releaseEscrowPayout(orderId);
                
                // Notify seller
                const { sendNotification } = await import('@/lib/services/notifications');
                await sendNotification({
                    userId: order.seller_id,
                    type: 'receipt_confirmed',
                    title: '¡El comprador ha recibido tu artículo!',
                    body: 'El comprador ha confirmado la recepción. Recibirás el pago en tu monedero muy pronto.',
                    data: { url: '/ventas' }
                });

                return NextResponse.json({ success: true });
            }

            case 'mark_shipped': {
                if (order.seller_id !== user.id) return new NextResponse("Unauthorized", { status: 403 });
                if (order.status !== "paid_held") {
                    return new NextResponse("Order cannot be marked as shipped at this stage", { status: 400 });
                }

                const { error: updateError } = await supabaseAdmin
                    .from("escrow_orders")
                    .update({ status: "awaiting_delivery" })
                    .eq("id", orderId);

                if (updateError) throw new Error("Failed to mark order as shipped");

                // Notify buyer
                const { data: listing } = await supabaseAdmin.from('listings').select('title').eq('id', order.listing_id).single();
                const { sendNotification } = await import('@/lib/services/notifications');
                await sendNotification({
                    userId: order.buyer_id,
                    type: 'shipped',
                    title: '¡Tu pedido ha sido enviado!',
                    body: `El vendedor ha enviado tu compra: ${listing?.title || 'artículo'}.`,
                    data: { url: '/compras' }
                });

                return NextResponse.json({ success: true });
            }

            case 'initiate_return': {
                if (order.buyer_id !== user.id) return new NextResponse("Unauthorized", { status: 403 });
                if (order.status !== "paid_held" && order.status !== "awaiting_delivery") {
                    return new NextResponse("Return cannot be initiated at this stage", { status: 400 });
                }

                const { error: updateError } = await supabaseAdmin
                    .from("escrow_orders")
                    .update({ status: "return_initiated" })
                    .eq("id", orderId);

                if (updateError) throw new Error("Failed to initiate return");
                return NextResponse.json({ success: true });
            }

            case 'confirm_return': {
                if (order.seller_id !== user.id) return new NextResponse("Unauthorized", { status: 403 });
                if (order.status !== "return_initiated") {
                    return new NextResponse("Return hasn't been initiated by the buyer", { status: 400 });
                }
                if (!order.stripe_payment_intent_id) {
                    return new NextResponse("Missing payment intent to process refund", { status: 400 });
                }

                // Stripe Refund
                const stripe = getStripe(order.listings?.tenant_id);
                await stripe.refunds.create({
                    payment_intent: order.stripe_payment_intent_id,
                    metadata: { escrow_order_id: order.id }
                });

                await supabaseAdmin
                    .from("escrow_orders")
                    .update({
                        status: "refunded",
                        refunded_at: new Date().toISOString()
                    })
                    .eq("id", order.id);

                // Update wallet balances (deduct pending)
                const { data: wallet } = await supabaseAdmin
                    .from("professional_wallets")
                    .select("id, pending_balance_cents")
                    .eq("user_id", order.seller_id)
                    .single();

                if (wallet) {
                    await supabaseAdmin
                        .from("professional_wallets")
                        .update({
                            pending_balance_cents: Math.max(0, wallet.pending_balance_cents - order.seller_net_amount_cents),
                        })
                        .eq("id", wallet.id);
                        
                    await supabaseAdmin
                        .from("wallet_transactions")
                        .insert({
                            wallet_id: wallet.id,
                            escrow_order_id: order.id,
                            type: "refund_processed",
                            amount_cents: -order.seller_net_amount_cents,
                            description: `Devolución al comprador procesada`,
                        });
                }

                return NextResponse.json({ success: true });
            }

            default:
                return new NextResponse("Invalid action", { status: 400 });
        }

    } catch (error: any) {
        console.error("Native Escrow Action Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
