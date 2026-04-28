import { NextResponse } from 'next/server';
import { MarketETLService } from '@/lib/services/etl/MarketETLService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Vercel Cron sends a Bearer token or uses vercel.json protection
        // We can optionally verify process.env.CRON_SECRET if configured
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Run ETL async (don't await fully if it takes longer than Vercel's timeout,
        // though Vercel Pro allows up to 5 mins. For safety, we can await it as it shouldn't take more than 30s)
        await MarketETLService.run();

        return NextResponse.json({ success: true, message: 'Market ETL executed successfully' });
    } catch (error: any) {
        console.error('Cron ETL Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
