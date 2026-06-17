require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function main() {
    const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 100 });
    let successfulPayments = paymentIntentsResponse.data.filter(pi => 
        pi.status === "succeeded"
    );
    console.log(successfulPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        metadata: p.metadata,
        created: new Date(p.created * 1000)
    })));
}
main();
