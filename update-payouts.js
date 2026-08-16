require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.EQUIPOP_STRIPE_SECRET_KEY);

async function update() {
    try {
        const account = await stripe.accounts.update(
            // We need the account ID of the platform, or we can't update it without passing the ID
            // But wait, the API key belongs to the platform.
        );
    } catch (err) {
        console.error(err.message);
    }
}
update();
