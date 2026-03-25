import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheckoutFlow } from "@/components/profesionales/SubscriptionCheckoutFlow";

export default async function SubscriptionCheckoutPage({ params, searchParams }: { params: Promise<{ planId: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { planId } = await params;
    const sp = await searchParams;
    const isAnnual = sp.interval === "year";
    if (planId !== "start" && planId !== "pro") {
        redirect("/profesionales");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?redirect=/profesionales/checkout/${planId}`);
    }

    let priceId = "";
    if (planId === "start") {
        priceId = "price_1TBJ6b6eGJa0K3pVDmyCDPeW";
    } else if (planId === "pro") {
        priceId = isAnnual ? "price_1TEp6n6eGJa0K3pVYN5gOSwW" : "price_1TBJ7M6eGJa0K3pVFfx0h8Fz";
    }

    return (
        <div className="min-h-screen bg-[var(--ag-sys-color-background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <SubscriptionCheckoutFlow planId={planId} priceId={priceId} isAnnual={isAnnual} />
            </div>
        </div>
    );
}
