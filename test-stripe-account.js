require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.EQUIPOP_STRIPE_SECRET_KEY);

async function check() {
    try {
        const account = await stripe.accounts.retrieve('acct_1Tm9UQ8aPARqMjFh');
        console.log("Current Type:", account.type);
        console.log("Current Business Type:", account.business_type);
        
        // Let's try to change it
        const updated = await stripe.accounts.update('acct_1Tm9UQ8aPARqMjFh', {
            business_type: 'individual'
        });
        
        console.log("Updated Business Type:", updated.business_type);
    } catch (err) {
        console.error(err.message);
    }
}
check();
