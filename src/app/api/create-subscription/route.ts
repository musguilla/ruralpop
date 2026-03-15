import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { priceId } = body;

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Validate plan vs existing
        const { data: profile } = await supabase
            .from("users")
            .select("stripe_customer_id, plan_type")
            .eq("id", user.id)
            .single();

        if (profile?.plan_type !== "free" && profile?.plan_type !== null) {
            return new NextResponse("Already subscribed", { status: 400 });
        }

        let customerId = profile?.stripe_customer_id;

        // Si no tiene Customer ID de Stripe, se lo creamos
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabaseUUID: user.id
                }
            });
            customerId = customer.id;

            // Guardamos el nuevo stripe_customer_id
            await supabase
                .from("users")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // Crear la Suscripción incompleta para Elements
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                price: priceId,
            }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                userId: user.id,
                priceId: priceId
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err: unknown) {
        console.error("Error creating subscription:", err);
        return new NextResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 });
    }
}
