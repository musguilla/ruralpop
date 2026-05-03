"use server";

import { confirmEscrowReception, initiateEscrowReturn } from "@/lib/services/escrow";
import { revalidatePath } from "next/cache";

export async function handleConfirmReception(orderId: string) {
    try {
        await confirmEscrowReception(orderId);
        revalidatePath("/dashboard/compras");
        revalidatePath("/dashboard/monedero");
        return { success: true };
    } catch (error: any) {
        console.error("Error confirming reception:", error);
        return { success: false, error: error.message };
    }
}

export async function handleInitiateReturn(orderId: string) {
    try {
        await initiateEscrowReturn(orderId);
        revalidatePath("/dashboard/compras");
        revalidatePath("/dashboard/monedero");
        return { success: true };
    } catch (error: any) {
        console.error("Error initiating return:", error);
        return { success: false, error: error.message };
    }
}
