require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const key = process.env.EQUIPOP_STRIPE_SECRET_KEY;
    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Searching Stripe Checkout Sessions ===");
    const sessions = await stripe.checkout.sessions.list({ limit: 30 });
    for (const s of sessions.data) {
        if (s.payment_status === 'paid') {
            console.log(`[${new Date(s.created * 1000).toISOString()}] Session: ${s.id} Email: ${s.customer_details?.email} Amount: ${s.amount_total/100}€ Meta:`, s.metadata);
        }
    }
}

main();
