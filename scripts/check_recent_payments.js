require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
    const stripeEquipop = new Stripe(process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Recent Ruralpop Payments ===");
    const pisRuralpop = await stripe.paymentIntents.list({ limit: 10 });
    for (const pi of pisRuralpop.data) {
        console.log(`[${new Date(pi.created * 1000).toISOString()}] Amount: ${pi.amount/100}€ Status: ${pi.status} Email: ${pi.receipt_email || pi.customer_details?.email} Meta:`, pi.metadata);
    }

    console.log("\n=== Recent Equipop Payments ===");
    const pisEquipop = await stripeEquipop.paymentIntents.list({ limit: 10 });
    for (const pi of pisEquipop.data) {
        console.log(`[${new Date(pi.created * 1000).toISOString()}] Amount: ${pi.amount/100}€ Status: ${pi.status} Email: ${pi.receipt_email || pi.customer_details?.email} Meta:`, pi.metadata);
    }
}

main();
