require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPayments() {
  console.log("Fetching recent successful payment intents from Stripe...");
  
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10,
    });
    
    const recentSucceeded = paymentIntents.data
      .filter(pi => pi.status === 'succeeded' && pi.amount === 199)
      .map(pi => ({
        id: pi.id,
        amount: pi.amount,
        created: new Date(pi.created * 1000).toLocaleString(),
        metadata: pi.metadata
      }));
      
    console.log(JSON.stringify(recentSucceeded, null, 2));
  } catch (e) {
    console.error("Stripe error:", e);
  }
}

checkPayments();
