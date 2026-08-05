import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const emails = ['jorgedominguezviqueira@gmail.com'];
        const featuredUntil = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
        const results = [];

        for (const email of emails) {
            const { data: users } = await supabase.from('users').select('id').eq('email', email);
            if (!users || users.length === 0) continue;
            
            const userId = users[0].id;
            
            const { data, error } = await supabase
                .from('listings')
                .update({
                    is_featured: true,
                    featured_until: featuredUntil
                })
                .eq('user_id', userId)
                .eq('status', 'active')
                .select('id, title, is_featured, featured_until');

            results.push({ email, updatedCount: data?.length || 0, data, error: error?.message });
        }

        return NextResponse.json({ success: true, results });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
