import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import stripe from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { data: publicUser } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!publicUser?.stripe_customer_id) {
            return new NextResponse('No Stripe Customer found for this user', { status: 400 });
        }

        // The URL to redirect to after the user manages their subscription
        const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/pro`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: publicUser.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.redirect(portalSession.url, 303);

    } catch (error) {
        console.error('Error creating portal session:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
