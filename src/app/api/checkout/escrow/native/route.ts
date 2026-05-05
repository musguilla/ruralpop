import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";
import { calculateRuralpopFee } from "@/lib/services/escrow";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized - Missing Token", { status: 401 });
        }
        const token = authHeader.split(" ")[1];

        // Usamos el cliente admin de Supabase para poder verificar el token directamente
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { listingId } = body;

        if (!listingId) {
            return new NextResponse("Missing listingId", { status: 400 });
        }

        // 1. Fetch listing and verify seller
        const { data: listing, error: listingError } = await supabaseAdmin
            .from("listings")
            .select(`
              id, title, price, shipping_price, image_urls, user_id, 
              users:user_id ( id, email, name, stripe_customer_id )
            `)
            .eq("id", listingId)
            .single();

        if (listingError || !listing) {
            return new NextResponse("Listing not found", { status: 404 });
        }

        const seller = listing.users as any;
        if (!seller || !['testpro@ruralpop.com', 'hildegartbaquero@gmail.com'].includes(seller.email?.toLowerCase().trim() || '')) {
            return new NextResponse("Escrow not available for this seller", { status: 403 });
        }

        if (seller.id === user.id) {
            return new NextResponse("Cannot buy your own listing", { status: 400 });
        }

        // 2. Fetch professional wallet
        const { data: wallet, error: walletError } = await supabaseAdmin
            .from("professional_wallets")
            .select("stripe_connected_account_id")
            .eq("user_id", seller.id)
            .single();

        if (walletError || !wallet?.stripe_connected_account_id) {
            return new NextResponse("El vendedor aún no ha configurado sus pagos de forma segura.", { status: 400 });
        }

        // Check if charges are enabled
        const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
        if (!account.charges_enabled) {
            return new NextResponse("El vendedor aún no ha completado la configuración para recibir pagos.", { status: 400 });
        }

        // 3. Calculate amounts
        const priceCents = Math.round(listing.price * 100);
        const shippingCents = Math.round((listing.shipping_price || 0) * 100);
        const feeCents = calculateRuralpopFee(priceCents);
        const sellerNetCents = priceCents + shippingCents;
        const totalCents = sellerNetCents + feeCents; // Buyer pays product + shipping + fee

        const orderId = crypto.randomUUID(); // Generate id for tracking

        // 4. Create Stripe PaymentIntent directly for native mobile apps
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCents,
            currency: "eur",
            payment_method_types: ['card'],
            transfer_group: `escrow_${orderId}`,
            metadata: {
                escrow_order_id: orderId,
                listing_id: listing.id,
                buyer_id: user.id,
                seller_id: seller.id,
            }
        });

        // 5. Save order in DB with initial status 'pending'
        const { error: insertError } = await supabaseAdmin
            .from("escrow_orders")
            .insert({
                id: orderId,
                listing_id: listing.id,
                buyer_id: user.id,
                seller_id: seller.id,
                seller_email: seller.email,
                gross_amount_cents: totalCents,
                ruralpop_fee_cents: feeCents,
                seller_net_amount_cents: sellerNetCents,
                stripe_payment_intent_id: paymentIntent.id,
                stripe_connected_account_id: wallet.stripe_connected_account_id,
                status: "pending"
            });

        if (insertError) {
            console.error("Failed to insert escrow order:", insertError);
            return new NextResponse("Error saving order", { status: 500 });
        }

        return NextResponse.json({
            paymentIntentClientSecret: paymentIntent.client_secret,
        });

    } catch (error: any) {
        console.error("Native Escrow Checkout Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
