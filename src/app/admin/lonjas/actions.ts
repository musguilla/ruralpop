'use server';

import { MarketETLService } from '@/lib/services/etl/MarketETLService';

export async function triggerEtlAction(sourceId?: string) {
    try {
        await MarketETLService.run(sourceId);
        // We rely on router.refresh() in the client instead of a global layout revalidation 
        // to prevent unpredictable "Server Components render" errors during POST responses.
        return { success: true };
    } catch (error: any) {
        console.error('ETL Action Error:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}
