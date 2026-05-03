import { NextResponse } from 'next/server';
import { autoReleaseExpiredEscrows } from '@/lib/services/escrow';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Validate Vercel CRON_SECRET if it exists
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await autoReleaseExpiredEscrows();
    return NextResponse.json({ 
        success: true, 
        message: `Cron job executed`, 
        released: result?.releasedCount || 0 
    });
  } catch (error: any) {
    console.error('Auto release error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
