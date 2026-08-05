import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized", { status: 401 });
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

        const supabaseUser = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const tenantHeader = req.headers.get("x-tenant");

        const { data: userProfile } = await supabaseUser
            .from("users")
            .select("tenant_id")
            .eq("id", user.id)
            .single();

        const { data: wallet } = await supabaseUser
            .from("professional_wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        const tenantToUse = tenantHeader || userProfile?.tenant_id;
        let stripe = getStripe(tenantToUse);

        let isReady = false;
        if (wallet?.stripe_connected_account_id) {
            try {
                const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
                isReady = account.charges_enabled && account.details_submitted;
            } catch (stripeError) {
                console.error("Stripe account retrieve error:", stripeError);
                // Fallback attempt: if primary stripe instance failed, try the other stripe instance
                try {
                    const { stripeEquipop, default: defaultStripe } = await import("@/lib/stripe");
                    const altStripe = stripe === stripeEquipop ? defaultStripe : stripeEquipop;
                    const account = await altStripe.accounts.retrieve(wallet.stripe_connected_account_id);
                    isReady = account.charges_enabled && account.details_submitted;
                } catch (fallbackErr) {
                    console.error("Fallback Stripe account retrieve error:", fallbackErr);
                    isReady = false;
                }
            }
        }

        return NextResponse.json({ wallet, isStripeReady: isReady });
    } catch (error: any) {
        console.error("Wallet status error:", error);
        return new NextResponse(error.message || "Error checking wallet", { status: 500 });
    }
}
