"use server";

import { createEscrowCheckout } from "@/lib/services/escrow";

export async function handleEscrowCheckout(listingId: string) {
    try {
        const result = await createEscrowCheckout(listingId);
        return { success: true, url: result.url };
    } catch (error: any) {
        console.error("Error creating escrow checkout:", error);
        return { success: false, error: error.message };
    }
}
