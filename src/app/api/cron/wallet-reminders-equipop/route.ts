import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { EQUIPOP_EMAIL_TEMPLATES } from '@/constants/emailTemplates';
import { sendNotification } from '@/lib/services/notifications';

const resend = new Resend(process.env.RESEND_API_KEY!);

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

        // Calculate date ranges for 1 day ago, 3 days ago, and 7 days ago.
        const now = new Date();

        const getDateRange = (daysAgo: number) => {
            const start = new Date(now);
            start.setDate(now.getDate() - daysAgo);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            return { start, end };
        };

        const day1 = getDateRange(1);
        const day3 = getDateRange(3);
        const day7 = getDateRange(7);

        // Fetch users from Equipop created in these timeframes
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select(`
                id, 
                email, 
                name,
                created_at,
                professional_wallets (
                    stripe_connected_account_id
                )
            `)
            .eq('tenant_id', 'equipop')
            .or(
                `and(created_at.gte.${day1.start.toISOString()},created_at.lte.${day1.end.toISOString()}),` +
                `and(created_at.gte.${day3.start.toISOString()},created_at.lte.${day3.end.toISOString()}),` +
                `and(created_at.gte.${day7.start.toISOString()},created_at.lte.${day7.end.toISOString()})`
            );

        if (error) {
            console.error('Error fetching users for wallet reminder cron:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!users || users.length === 0) {
            return NextResponse.json({ message: 'No users to remind today.' }, { status: 200 });
        }

        // Filter users who haven't completed their wallet verification
        const usersToRemind = users.filter(user => {
            // A user needs a reminder if they don't have a wallet, or if their wallet doesn't have a stripe_connected_account_id
            const wallet = Array.isArray(user.professional_wallets) 
                ? user.professional_wallets[0] 
                : user.professional_wallets;
            return !wallet || !wallet.stripe_connected_account_id;
        });

        if (usersToRemind.length === 0) {
            return NextResponse.json({ message: 'All users have verified wallets.' }, { status: 200 });
        }

        // Send emails
        const template = EQUIPOP_EMAIL_TEMPLATES.find(t => t.id === 'completar-monedero-equipop');
        
        if (!template) {
            console.error('Wallet reminder template not found');
            return NextResponse.json({ error: 'Template not found' }, { status: 500 });
        }

        let sentCount = 0;

        for (const user of usersToRemind) {
            if (!user.email) continue;

            const name = user.name || 'Jinete';
            const htmlContent = template.htmlContent.replace('{{name}}', name);

            try {
                await resend.emails.send({
                    from: 'Equipop <hola@equipop.app>',
                    to: user.email,
                    subject: template.subject,
                    html: htmlContent,
                });
                
                // Enviar también Notificación Push
                await sendNotification(
                    user.id,
                    'wallet_reminder',
                    '¡Completa tu monedero!',
                    'Finaliza la configuración de tu monedero para empezar a vender de forma 100% segura.',
                    { url: '/monedero' },
                    'equipop'
                );

                sentCount++;
            } catch (err) {
                console.error(`Failed to send wallet reminder to ${user.email}:`, err);
            }
        }

        return NextResponse.json({ 
            message: `Wallet reminders sent successfully.`, 
            totalSent: sentCount,
            usersFound: usersToRemind.length
        }, { status: 200 });

    } catch (err: any) {
        console.error('Exception in wallet reminder cron:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
