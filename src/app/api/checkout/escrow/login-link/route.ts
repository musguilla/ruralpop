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
            .select("stripe_connected_account_id")
            .eq("user_id", user.id)
            .maybeSingle();

        const tenantToUse = tenantHeader || userProfile?.tenant_id;
        let stripe = getStripe(tenantToUse);

        const accountId = wallet?.stripe_connected_account_id;

        if (!accountId) {
            return new NextResponse("Stripe account not found", { status: 404 });
        }

        let loginLink;
        try {
            loginLink = await stripe.accounts.createLoginLink(accountId);
        } catch (stripeErr) {
            console.error("Stripe createLoginLink error:", stripeErr);
            const { stripeEquipop, default: defaultStripe } = await import("@/lib/stripe");
            const altStripe = stripe === stripeEquipop ? defaultStripe : stripeEquipop;
            loginLink = await altStripe.accounts.createLoginLink(accountId);
        }

        return NextResponse.json({ url: loginLink.url });
    } catch (error: any) {
        console.error("Mobile Stripe Login Link Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
