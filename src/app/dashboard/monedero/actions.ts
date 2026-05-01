"use server";

import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";

export async function createStripeOnboardingLink() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    // Check if wallet exists
    let { data: wallet } = await supabase
        .from("professional_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

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
            await supabase.from("professional_wallets").update({ stripe_connected_account_id: accountId }).eq("id", wallet.id);
        } else {
            await supabase.from("professional_wallets").insert({
                user_id: user.id,
                stripe_connected_account_id: accountId,
            });
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

    return { url: accountLink.url };
}
