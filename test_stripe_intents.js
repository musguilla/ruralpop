require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check() {
  const listingId = 'ce4dbd47-1cf4-40a6-a4ed-d363fd5fd74d';
  const paymentIntentsResponse = await stripe.paymentIntents.search({
    query: `metadata['listingId']:'${listingId}'`,
    limit: 10
  });
  console.log("Payment Intents:", paymentIntentsResponse.data.map(pi => ({
      id: pi.id,
      status: pi.status,
      metadata: pi.metadata
  })));
}
check();
