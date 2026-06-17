import 'dotenv/config.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
async function run() {
    try {
        const intents = await stripe.paymentIntents.list({ limit: 5 });
        console.log('PaymentIntents Metadata:', intents.data.map(i => i.metadata));
        const inv = await stripe.invoices.list({ limit: 5 });
        console.log('Invoices Metadata:', inv.data.map(i => i.metadata));
    } catch(e) {
        console.error(e.message);
    }
}
run();
