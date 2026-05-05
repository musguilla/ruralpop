"use server";

import { createEscrowCheckout, createEscrowPaymentIntentNative } from "@/lib/services/escrow";

export async function handleEscrowCheckout(listingId: string) {
    try {
        const result = await createEscrowCheckout(listingId);
        return { success: true, url: result.url };
    } catch (error: any) {
        console.error("Error creating escrow checkout:", error);
        return { success: false, error: error.message };
    }
}

export async function handleEscrowPaymentIntentNative(listingId: string) {
    try {
        const result = await createEscrowPaymentIntentNative(listingId);
        return { success: true, clientSecret: result.clientSecret, orderId: result.orderId };
    } catch (error: any) {
        console.error("Error creating escrow payment intent:", error);
        return { success: false, error: error.message };
    }
}
