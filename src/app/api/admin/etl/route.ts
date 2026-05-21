import { NextResponse } from 'next/server';
import { MarketETLService } from '@/lib/services/etl/MarketETLService';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Ignorar si el body viene vacío
        }
        
        const sourceId = (body as any).sourceId;

        await MarketETLService.run(sourceId);
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('ETL API Route Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error desconocido procesando la lonja' }, { status: 500 });
    }
}
