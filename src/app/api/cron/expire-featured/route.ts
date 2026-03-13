import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    // Basic security check: verify Authorization header
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // We need the service role key to bypass RLS and perform bulk updates
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now = new Date().toISOString();

        // Expire lists where featured_until is in the past
        const { data, error, count } = await supabaseAdmin
            .from('listings')
            .update({
                is_featured: false,
                featured_until: null
            })
            .eq('is_featured', true)
            .lt('featured_until', now)
            .select('id');

        if (error) {
            console.error('Error expiring featured listings:', error);
            return new NextResponse(`Error: ${error.message}`, { status: 500 });
        }

        console.log(`Cron execution complete. Expired ${data?.length || 0} listings.`);

        return NextResponse.json({
            success: true,
            expiredCount: data?.length || 0,
            expiredIds: data?.map(d => d.id) || []
        });

    } catch (err: any) {
        console.error('Cron job exception:', err);
        return new NextResponse(`Exception: ${err.message}`, { status: 500 });
    }
}
