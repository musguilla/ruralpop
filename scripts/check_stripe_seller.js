require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    // Check with Equipop Stripe Secret Key
    const stripeKey = process.env.STRIPE_SECRET_KEY_EQUIPOP || process.env.STRIPE_SECRET_KEY;
    console.log("Stripe Key present:", !!stripeKey);

    const stripe = new Stripe(stripeKey);
    const accountId = 'acct_1TtMu09ggo2ULsit';

    try {
        console.log(`\n=== Retrieving Stripe Account (${accountId}) ===`);
        const account = await stripe.accounts.retrieve(accountId);
        console.log("Stripe Account Details:");
        console.log("id:", account.id);
        console.log("details_submitted:", account.details_submitted);
        console.log("charges_enabled:", account.charges_enabled);
        console.log("payouts_enabled:", account.payouts_enabled);
        console.log("requirements:", JSON.stringify(account.requirements, null, 2));
    } catch (err) {
        console.error("Stripe retrieve error:", err);
    }
}

main();
