require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check() {
  const paymentIntentsResponse = await stripe.paymentIntents.search({
    query: "status:'succeeded'",
    limit: 100
  });
  let successfulPayments = paymentIntentsResponse.data.filter(pi => 
      pi.metadata?.planId === "animal_welfare_validation"
  );
  console.log("Validated listings:", successfulPayments.map(p => p.metadata.listingId));
}
check();
