import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelfareReminderEmail } from '@/lib/email/welfare-reminder';

export async function GET(req: Request) {
    // Only allow Vercel Cron or authorized requests
    const authHeader = req.headers.get('authorization');
    if (
        process.env.NODE_ENV === 'production' &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // We want to find listings created exactly 3 days ago or 7 days ago.
        // We'll calculate the date ranges for "3 days ago" and "7 days ago".
        const now = new Date();
        
        const threeDaysAgoStart = new Date(now);
        threeDaysAgoStart.setDate(now.getDate() - 3);
        threeDaysAgoStart.setHours(0, 0, 0, 0);
        
        const threeDaysAgoEnd = new Date(threeDaysAgoStart);
        threeDaysAgoEnd.setHours(23, 59, 59, 999);

        const sevenDaysAgoStart = new Date(now);
        sevenDaysAgoStart.setDate(now.getDate() - 7);
        sevenDaysAgoStart.setHours(0, 0, 0, 0);

        const sevenDaysAgoEnd = new Date(sevenDaysAgoStart);
        sevenDaysAgoEnd.setHours(23, 59, 59, 999);

        // Fetch draft listings that might be welfare restricted.
        // Since we don't have a specific column for "isRestricted", we'll check all drafts
        // created within these two days. (In our system, most drafts are welfare-restricted).
        const { data: listings, error } = await supabaseAdmin
            .from('listings')
            .select(`
                id, 
                title, 
                image_urls, 
                created_at, 
                status,
                user_id,
                users ( email )
            `)
            .eq('status', 'draft')
            .or(
                `and(created_at.gte.${threeDaysAgoStart.toISOString()},created_at.lte.${threeDaysAgoEnd.toISOString()}),and(created_at.gte.${sevenDaysAgoStart.toISOString()},created_at.lte.${sevenDaysAgoEnd.toISOString()})`
            );

        if (error) {
            console.error('Error fetching draft listings for cron:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let emailsSent = 0;

        for (const listing of listings || []) {
            const userEmail = (listing.users as any)?.email;
            if (userEmail) {
                const success = await sendWelfareReminderEmail(userEmail, {
                    id: listing.id,
                    title: listing.title,
                    image_urls: listing.image_urls
                });
                if (success) emailsSent++;
            }
        }

        return NextResponse.json({ success: true, processed: listings?.length || 0, emailsSent });
    } catch (error: any) {
        console.error('Cron job error (welfare-draft-reminders):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
