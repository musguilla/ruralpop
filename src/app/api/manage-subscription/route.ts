import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, targetPlan } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse(JSON.stringify({ error: "No autorizado" }), { status: 401 });
        }

        const { data: profile } = await supabase
            .from("users")
            .select("stripe_subscription_id, plan_type")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_subscription_id) {
            return new NextResponse(JSON.stringify({ error: "Suscripción no encontrada en el perfil" }), { status: 404 });
        }

        const subscriptionId = profile.stripe_subscription_id;

        if (action === 'cancel') {
            await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
            return NextResponse.json({ success: true, message: "Suscripción programada para cancelación." });
        }

        if (action === 'change_plan' && targetPlan) {
            const priceId = targetPlan === "start" ? "price_1TBJ6b6eGJa0K3pVDmyCDPeW" : "price_1TBJ7M6eGJa0K3pVFfx0h8Fz";

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const subscriptionItemId = subscription.items.data[0].id;

            let scheduleId = subscription.schedule;

            // Define target payload for changing the plan at period end
            // Since `subscription_schedules` can be tricky, if no schedule exists:
            if (!scheduleId) {
                const schedule = await stripe.subscriptionSchedules.create({
                    from_subscription: subscriptionId,
                });
                scheduleId = schedule.id;
            }

            const schedule = await stripe.subscriptionSchedules.retrieve(typeof scheduleId === 'string' ? scheduleId : scheduleId!.id);

            // Create phrases array: current phase + next phase with new price
            const currentPhase = schedule.phases[0];
            
            await stripe.subscriptionSchedules.update(schedule.id, {
                end_behavior: 'release',
                phases: [
                    {
                        start_date: currentPhase.start_date,
                        end_date: currentPhase.end_date,
                        items: [
                            {
                                price: currentPhase.items[0].price as string,
                                quantity: 1,
                            }
                        ]
                    },
                    {
                        proration_behavior: 'none',
                        items: [
                            {
                                price: priceId,
                                quantity: 1,
                            }
                        ]
                    }
                ]
            });

            return NextResponse.json({ success: true, message: `Plan cambiado a ${targetPlan} para el próximo ciclo.` });
        }

        return new NextResponse(JSON.stringify({ error: "Acción inválida" }), { status: 400 });
    } catch (err: unknown) {
        console.error("Error managing subscription:", err);
        return new NextResponse(JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }), { status: 500 });
    }
}
