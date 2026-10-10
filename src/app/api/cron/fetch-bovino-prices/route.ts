import { NextResponse } from 'next/server';
import { MarketETLService } from '@/lib/services/etl/MarketETLService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration on Vercel Pro for cron jobs

export async function GET(request: Request) {
    try {
        // Vercel Cron sends a Bearer token or uses vercel.json protection
        // We can optionally verify process.env.CRON_SECRET if configured
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Execute Market ETL pipeline across all active market sources concurrently
        const result = await MarketETLService.run();

        return NextResponse.json({ success: true, message: 'Market ETL executed successfully', result });
    } catch (error: unknown) {
        console.error('Cron ETL Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during market ETL';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

