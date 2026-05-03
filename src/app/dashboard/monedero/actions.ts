"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import stripe from "@/lib/stripe";

export async function createStripeOnboardingLink() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        if (!user) throw new Error("No autenticado");

        // Use Admin client to bypass RLS for professional_wallets table
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Check if wallet exists
        let { data: wallet } = await supabaseAdmin
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

        return { url: accountLink.url };
    } catch (error: any) {
        console.error("Stripe Onboarding Error:", error);
        return { error: error.message || "Error al generar link de Stripe." };
    }
}

import { confirmEscrowReturn } from "@/lib/services/escrow";
import { revalidatePath } from "next/cache";

export async function handleConfirmReturn(orderId: string) {
    try {
        await confirmEscrowReturn(orderId);
        revalidatePath("/dashboard/monedero");
        revalidatePath("/dashboard/compras");
        return { success: true };
    } catch (error: any) {
        console.error("Error confirming return:", error);
        return { success: false, error: error.message };
    }
}
