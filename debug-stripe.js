require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.EQUIPOP_STRIPE_SECRET_KEY);

async function testTransfer() {
    try {
        const transfer = await stripe.transfers.create({
            amount: 10, // 10 cents
            currency: 'eur',
            destination: 'acct_1Tt6gl9G88cbQMuk'
        });
        console.log("Transfer succeeded!", transfer.id);
    } catch (error) {
        console.error("Transfer failed with error:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Type:", error.type);
    }
}
testTransfer();
