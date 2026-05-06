'use server';

import { MarketETLService } from '@/lib/services/etl/MarketETLService';
import { revalidatePath } from 'next/cache';

export async function triggerEtlAction(sourceId?: string) {
    try {
        await MarketETLService.run(sourceId);
        revalidatePath('/', 'layout'); // Purge entire cache since pricing updates are rare but globally significant
        return { success: true };
    } catch (error: any) {
        console.error('ETL Action Error:', error);
        return { success: false, error: error.message };
    }
}
