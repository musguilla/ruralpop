require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const key = process.env.EQUIPOP_STRIPE_SECRET_KEY;
    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Last 50 Equipop Payments ===");
    const pis = await stripe.paymentIntents.list({ limit: 50 });
    for (const pi of pis.data) {
        if (pi.status === 'succeeded') {
            console.log(`[${new Date(pi.created * 1000).toISOString()}] ID: ${pi.id} Amount: ${pi.amount/100}€ Email: ${pi.receipt_email || pi.customer_details?.email} Meta:`, pi.metadata);
        }
    }
}

main();
