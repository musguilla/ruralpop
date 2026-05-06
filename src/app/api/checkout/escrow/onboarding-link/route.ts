import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized - Missing Token", { status: 401 });
        }
        const token = authHeader.split(" ")[1];

        // Usamos el cliente admin de Supabase para poder verificar el token directamente
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if wallet exists
        let { data: wallet } = await supabaseAdmin
            .from("professional_wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        let accountId = wallet?.stripe_connected_account_id;

        if (!accountId) {
            // Create Express account
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            if (wallet) {
                const { error: updateError } = await supabaseAdmin.from("professional_wallets").update({ stripe_connected_account_id: accountId }).eq("id", wallet.id);
                if (updateError) throw new Error("Error actualizando wallet: " + updateError.message);
            } else {
                const { error: insertError } = await supabaseAdmin.from("professional_wallets").insert({
                    user_id: user.id,
                    stripe_connected_account_id: accountId,
                });
                if (insertError) throw new Error("Error insertando wallet: " + insertError.message);
            }
        }

        // Create Account Link
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruralpop.com";
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${baseUrl}/dashboard/monedero?refresh=true`,
            return_url: `${baseUrl}/dashboard/monedero?success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error("Mobile Stripe Onboarding Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
