require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const key = process.env.EQUIPOP_STRIPE_SECRET_KEY;
    const stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
    
    console.log("=== Details for pi_3TwrSk8vHm1CUl8e1cGf15UX ===");
    const pi = await stripe.paymentIntents.retrieve('pi_3TwrSk8vHm1CUl8e1cGf15UX');
    console.log(JSON.stringify(pi, null, 2));
}

main();
