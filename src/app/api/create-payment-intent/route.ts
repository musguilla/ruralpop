import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

const STRIPE_PLANS = {
    bump: { price: 149, name: "Subir arriba" },
    highlight_7: { price: 299, name: "Destacar 7 días" },
    highlight_20: { price: 499, name: "Destacar 20 días" },
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { listingId, planId } = body;

        if (!listingId || !planId || !(planId in STRIPE_PLANS)) {
            return new NextResponse("Invalid request", { status: 400 });
        }

        // Validate listing belongs to user
        const { data: listing, error } = await supabase
            .from("listings")
            .select("id, user_id")
            .eq("id", listingId)
            .single();

        if (error || !listing || listing.user_id !== user.id) {
            return new NextResponse("Not Found / Unauthorized", { status: 404 });
        }

        const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS];

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: plan.price, // in cents (149 = 1.49 EUR)
            currency: "eur",
            payment_method_types: ['card'],
            metadata: {
                listingId: listing.id,
                planId: planId,
                userId: user.id
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: unknown) {
        console.error("Stripe Error:", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
