import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need to use the actual stripe secret key, which is in Vercel.
// Let's print the error message from the remote API!
