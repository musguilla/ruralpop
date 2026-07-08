import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized - Missing Token", { status: 401 });
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

        const { data: userProfile } = await supabaseAdmin
            .from("users")
            .select("tenant_id")
            .eq("id", user.id)
            .single();

        const { data: wallet } = await supabaseAdmin
            .from("professional_wallets")
            .select("stripe_connected_account_id")
            .eq("user_id", user.id)
            .maybeSingle();

        const stripe = getStripe(userProfile?.tenant_id);

        const accountId = wallet?.stripe_connected_account_id;

        if (!accountId) {
            return new NextResponse("Stripe account not found", { status: 404 });
        }

        const loginLink = await stripe.accounts.createLoginLink(accountId);

        return NextResponse.json({ url: loginLink.url });
    } catch (error: any) {
        console.error("Mobile Stripe Login Link Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
