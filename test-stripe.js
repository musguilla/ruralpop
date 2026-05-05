const Stripe = require('stripe');

async function test() {
    try {
        const stripe = new Stripe("sk_test_placeholder");
        await stripe.accounts.retrieve("acct_123");
    } catch (e) {
        console.error(e.message);
    }
}
test();
