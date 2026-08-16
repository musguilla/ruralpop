require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const stripeKey = process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    console.log("Stripe Key present:", !!stripeKey, "Key prefix:", stripeKey ? stripeKey.substring(0, 7) : "none");

    if (!stripeKey) return;

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
        console.log("requirements currently_due:", account.requirements?.currently_due);
        console.log("requirements eventually_due:", account.requirements?.eventually_due);
        console.log("requirements disabled_reason:", account.requirements?.disabled_reason);
    } catch (err) {
        console.error("Stripe retrieve error:", err.message);
    }
}

main();
