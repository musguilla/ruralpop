import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheckoutFlow } from "@/components/profesionales/SubscriptionCheckoutFlow";

export default async function SubscriptionCheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
    const { planId } = await params;
    if (planId !== "start" && planId !== "pro") {
        redirect("/profesionales");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?redirect=/profesionales/checkout/${planId}`);
    }

    const priceId = planId === "start" ? "price_1TBJ6b6eGJa0K3pVDmyCDPeW" : "price_1TBJ7M6eGJa0K3pVFfx0h8Fz";

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <SubscriptionCheckoutFlow planId={planId} priceId={priceId} />
            </div>
        </div>
    );
}
