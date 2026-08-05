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

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const tenantHeader = req.headers.get("x-tenant");

        const { data: userProfile } = await supabaseAdmin
            .from("users")
            .select("tenant_id")
            .eq("id", user.id)
            .single();

        // Check if wallet exists
        let { data: wallet } = await supabaseAdmin
            .from("professional_wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        const tenantToUse = tenantHeader || userProfile?.tenant_id;
        const stripe = getStripe(tenantToUse);

        let accountId = wallet?.stripe_connected_account_id;

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruralpop.com";

        if (!accountId) {
            // Create Express account
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                business_type: 'individual',
                business_profile: {
                    url: baseUrl,
                    mcc: '5931',
                    product_description: 'Venta de artículos de segunda mano.'
                },
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
        let accountLink;
        try {
            accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${baseUrl}/dashboard/monedero?refresh=true`,
                return_url: `${baseUrl}/dashboard/monedero?success=true`,
                type: 'account_onboarding',
            });
        } catch (stripeError: any) {
            console.error("Stripe account link error:", stripeError);
            // If account was deleted in Stripe, recreate it
            if (stripeError.code === 'account_invalid' || stripeError.message?.includes('No such account') || stripeError.raw?.code === 'account_invalid') {
                const newAccount = await stripe.accounts.create({
                    type: 'express',
                    email: user.email,
                    business_type: 'individual',
                    business_profile: {
                        url: baseUrl,
                        mcc: '5931',
                        product_description: 'Venta de artículos de segunda mano.'
                    },
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                });
                accountId = newAccount.id;
                
                const { error: updateError } = await supabaseAdmin.from("professional_wallets").update({ stripe_connected_account_id: accountId }).eq("id", wallet.id);
                if (updateError) throw new Error("Error actualizando wallet con nueva cuenta: " + updateError.message);
                
                accountLink = await stripe.accountLinks.create({
                    account: accountId,
                    refresh_url: `${baseUrl}/dashboard/monedero?refresh=true`,
                    return_url: `${baseUrl}/dashboard/monedero?success=true`,
                    type: 'account_onboarding',
                });
            } else {
                throw stripeError;
            }
        }

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error("Mobile Stripe Onboarding Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}
