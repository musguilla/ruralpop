require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const key = process.env.EQUIPOP_STRIPE_SECRET_KEY;
    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Details for Checkout Session ===");
    const session = await stripe.checkout.sessions.retrieve('cs_live_a1uDT6Ux2tFq30n1lBd3aZWxjN9lmv5opgj0FUP8LJejXkCZcqCgJ3uZsC', {
        expand: ['line_items', 'customer']
    });
    console.log("Customer Details:", session.customer_details);
    console.log("Metadata:", session.metadata);
    console.log("Line Items:", JSON.stringify(session.line_items, null, 2));
}

main();
