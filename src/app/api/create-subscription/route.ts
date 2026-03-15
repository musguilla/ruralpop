import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const h = await headers();
        const origin = h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruralpop.com";
        const formData = await req.formData();
        const priceId = formData.get("priceId") as string;

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Redirect to login but save where they were going (or just go to /login frontend handles it)
            return NextResponse.redirect(`${origin}/login?redirect=/profesionales`, 303);
        }

        // Validate plan vs existing
        const { data: profile } = await supabase
            .from("users")
            .select("stripe_customer_id, plan_type")
            .eq("id", user.id)
            .single();

        if (profile?.plan_type !== "free" && profile?.plan_type !== null) {
            return NextResponse.redirect(`${origin}/dashboard/pro?error=already_subscribed`, 303);
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

        // Crear la sesión de Checkout de Suscripción recurrente
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true, // Por si en el futuro quiere dar descuentos
            success_url: `${origin}/dashboard/pro?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/profesionales?canceled=true`,
            metadata: {
                userId: user.id,
                priceId: priceId
            }
        });

        if (!session.url) {
            return new NextResponse("Error creating stripe session", { status: 500 });
        }

        return NextResponse.redirect(session.url, 303);
    } catch (err: unknown) {
        console.error("Error creating subscription:", err);
        return new NextResponse(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 });
    }
}
