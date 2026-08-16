require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const stripeKey = process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeKey);

    const sellerAccountId = 'acct_1TtBLV4Vo43gTAvK';

    console.log(`=== Checking Stripe Account Balance for ${sellerAccountId} ===`);
    try {
        const balance = await stripe.balance.retrieve({ stripeAccount: sellerAccountId });
        console.log("Seller Stripe Balance:", JSON.stringify(balance, null, 2));
    } catch (err) {
        console.error("Balance error:", err.message);
    }
}

main();
