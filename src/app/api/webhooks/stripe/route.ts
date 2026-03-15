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
                            plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Fake 1 month renewal for now
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

    return new NextResponse(null, { status: 200 });
}
