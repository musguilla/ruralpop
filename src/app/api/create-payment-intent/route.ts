import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const STRIPE_PLANS = {
    bump: { price: 149, name: "Subir arriba" },
    highlight_7: { price: 299, name: "Destacar 7 días" },
    highlight_20: { price: 499, name: "Destacar 20 días" },
    animal_welfare_validation: { price: 199, name: "Validación Bienestar Animal" },
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Next.js createClient() relies on cookies, which mobile fetch doesn't send by default.
        // We must manually parse the Bearer token if provided.
        const authHeader = req.headers.get('authorization');
        let user;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data } = await supabase.auth.getUser(token);
            user = data.user;
        } else {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        }

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { listingId, planId, welfareDetails } = body;

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

        // 1. Get or create Stripe Customer
        let customerId = null;
        
        const { data: userProfile } = await supabase
            .from("users")
            .select("stripe_customer_id, email")
            .eq("id", user.id)
            .single();

        if (userProfile?.stripe_customer_id) {
            customerId = userProfile.stripe_customer_id;
        } else {
            // Create Stripe customer
            const newCustomer = await stripe.customers.create({
                email: user.email || userProfile?.email || undefined,
                metadata: { supabase_user_id: user.id }
            });
            customerId = newCustomer.id;

            // Save back to users table using admin client to bypass potential RLS
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            
            await supabaseAdmin
                .from("users")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // 2. Create Ephemeral Key for mobile SDK
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId },
            { apiVersion: '2023-10-16' }
        );

        // 3. Create a PaymentIntent with the order amount and currency
        const metadata: any = {
            listingId: listing.id,
            planId: planId,
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
            amount: plan.price, // in cents (149 = 1.49 EUR)
            currency: "eur",
            customer: customerId,
            setup_future_usage: 'off_session',
            payment_method_types: ['card'],
            metadata: metadata
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customerId
        });
    } catch (error: unknown) {
        console.error("Stripe Error:", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
