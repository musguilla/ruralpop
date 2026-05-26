import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

const PLAN_PRICE = 199; // 1.99€

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { welfareDetails, listingId } = body;

        if (!listingId) {
            return new NextResponse("Missing listingId", { status: 400 });
        }

        // Create a PaymentIntent with the order amount and currency
        const metadata: any = {
            planId: "animal_welfare_validation",
            listingId: listingId,
            userId: user.id
        };

        if (welfareDetails) {
            if (welfareDetails.nif) metadata.welfare_nif = welfareDetails.nif;
            if (welfareDetails.zoo_register_number) metadata.welfare_zoo_register_number = welfareDetails.zoo_register_number;
            if (welfareDetails.phone) metadata.welfare_phone = welfareDetails.phone;
            if (welfareDetails.name) metadata.welfare_name = welfareDetails.name;
            if (welfareDetails.lastName) metadata.welfare_lastName = welfareDetails.lastName;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: PLAN_PRICE,
            currency: "eur",
            payment_method_types: ['card'],
            metadata: metadata
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: unknown) {
        console.error("Stripe Error:", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
