import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const token = authHeader.split(" ")[1];

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: wallet } = await supabaseAdmin
            .from("professional_wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        let isReady = false;
        if (wallet?.stripe_connected_account_id) {
            const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
            isReady = account.charges_enabled && account.details_submitted;
        }

        return NextResponse.json({ wallet, isStripeReady: isReady });
    } catch (error: any) {
        console.error("Wallet status error:", error);
        return new NextResponse(error.message || "Error checking wallet", { status: 500 });
    }
}
