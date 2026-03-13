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
    } catch (error: any) {
        console.error("Webhook signature verification failed.", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Initialize Supabase Admin strictly for webhooks to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { listingId, planId, userId } = paymentIntent.metadata;

        console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);

        if (listingId && planId) {
            try {
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
            } catch (err: any) {
                console.error("Database Error on Webhook:", err);
                return new NextResponse(`Database Error: ${err.message}`, { status: 500 });
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
