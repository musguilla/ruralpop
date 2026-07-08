import { loadStripe, Stripe } from "@stripe/stripe-js";
import { EQUIPOP_TENANT_SLUG, TENANTS_CONFIG } from "@/config/tenants";

let stripePromise: Promise<Stripe | null>;
let stripePromiseEquipop: Promise<Stripe | null>;

export const getStripeClient = (tenantIdOrSlug?: string | null) => {
    let isEquipop = false;
    
    if (
        tenantIdOrSlug === EQUIPOP_TENANT_SLUG || 
        tenantIdOrSlug === TENANTS_CONFIG[EQUIPOP_TENANT_SLUG].id
    ) {
        isEquipop = true;
    } else if (typeof window !== 'undefined') {
        if (window.location.hostname.includes('equipop') || window.location.pathname.startsWith('/equipop')) {
            isEquipop = true;
        }
    }

    if (isEquipop) {
        if (!stripePromiseEquipop) {
            stripePromiseEquipop = loadStripe(process.env.NEXT_PUBLIC_EQUIPOP_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");
        }
        return stripePromiseEquipop;
    }

    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");
    }
    return stripePromise;
};
