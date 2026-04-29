'use server';

import { MarketETLService } from '@/lib/services/etl/MarketETLService';
import { revalidatePath } from 'next/cache';

export async function triggerEtlAction(sourceId?: string) {
    try {
        await MarketETLService.run(sourceId);
        revalidatePath('/admin/lonjas');
        revalidatePath('/precios-ganado/vacuno');
        return { success: true };
    } catch (error: any) {
        console.error('ETL Action Error:', error);
        return { success: false, error: error.message };
    }
}
