import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";
import stripe from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user profile to get saved phone
    const { data: profile } = await supabase
        .from("users")
        .select("phone, is_ghost, role, nif, zoo_register_number, name")
        .eq("id", user.id)
        .single();

    if (profile?.is_ghost) {
        redirect("/profesionales?ghost_claim=true");
    }

    const savedPhone = profile?.phone ?? null;

    // Fetch provinces to feed the first selector
    const { data: provinces } = await supabase
        .from("provinces")
        .select("id, name")
        .order("name");

    const initialProvinces = provinces || [];

    // Fetch Wallet to check Stripe readiness
    const { data: wallet } = await supabase
        .from("professional_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

    let isStripeReady = false;
    if (wallet?.stripe_connected_account_id) {
        try {
            const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
            isStripeReady = account.charges_enabled && account.details_submitted;
        } catch (e) {
            console.error("Error retrieving Stripe account:", e);
        }
    }

    const isProfesional = profile?.role === 'profesional';
    const userProfile = {
        name: profile?.name || "",
        nif: profile?.nif || "",
        zoo_register_number: profile?.zoo_register_number || ""
    };

    return <UploadForm savedPhone={savedPhone} initialProvinces={initialProvinces} userEmail={user.email} hasWalletConfigured={isStripeReady} isProfesional={isProfesional} userProfile={userProfile} />;
}
