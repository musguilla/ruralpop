import Stripe from "stripe";
import { EQUIPOP_TENANT_SLUG, TENANTS_CONFIG } from "@/config/tenants";

// Ruralpop Stripe Instance (Default)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // @ts-ignore
    apiVersion: "2024-12-18.acacia",
});

// Equipop Stripe Instance
export const stripeEquipop = new Stripe(process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // @ts-ignore
    apiVersion: "2024-12-18.acacia",
});

/**
 * Returns the correct Stripe instance based on the tenant.
 * Uses Ruralpop as fallback to guarantee backwards compatibility.
 */
export const getStripe = (tenantIdOrSlug?: string | null): Stripe => {
    if (!tenantIdOrSlug) return stripe;
    
    if (
        tenantIdOrSlug === EQUIPOP_TENANT_SLUG || 
        tenantIdOrSlug === TENANTS_CONFIG[EQUIPOP_TENANT_SLUG].id
    ) {
        return stripeEquipop;
    }
    
    return stripe;
};

export default stripe;
