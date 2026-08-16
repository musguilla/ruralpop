require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const key = process.env.EQUIPOP_STRIPE_SECRET_KEY;
    console.log("Key available:", !!key);
    if (!key) return;
    
    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Recent Equipop Payments ===");
    const pisEquipop = await stripe.paymentIntents.list({ limit: 10 });
    for (const pi of pisEquipop.data) {
        console.log(`[${new Date(pi.created * 1000).toISOString()}] ID: ${pi.id} Amount: ${pi.amount/100}€ Status: ${pi.status} Email: ${pi.receipt_email} Meta:`, pi.metadata);
    }
}

main();
