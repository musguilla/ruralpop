import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
      const account = await stripe.accounts.create({
          type: 'express',
          email: 'hildegartbaquero@gmail.com', // user's email
          capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
          },
      });
      console.log("Account created:", account.id);
  } catch (e) {
      console.log("Error:", e.message);
  }
}

test();
