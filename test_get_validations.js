require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function check() {
  const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 100 });
  let successfulPayments = paymentIntentsResponse.data.filter(pi => 
      pi.status === "succeeded" && pi.metadata?.planId === "animal_welfare_validation"
  );
  console.log("Validated listings:", successfulPayments.map(p => p.metadata.listingId));
}
check();
