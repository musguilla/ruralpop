import fs from 'fs';
import dotenv from 'dotenv';
const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
