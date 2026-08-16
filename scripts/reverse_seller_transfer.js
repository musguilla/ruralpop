require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function main() {
    const stripeKey = process.env.EQUIPOP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeKey);

    const transferId = 'tr_1U3QXe8vHm1CUl8epQjzrxW6';

    console.log(`=== Reversing Stripe Transfer (${transferId}) ===`);
    try {
        const reversal = await stripe.transfers.createReversal(
            transferId,
            {
                amount: 1500, // 15,00 EUR
                description: 'Reversión por reembolso a la compradora Noelia (falta de envío)'
            }
        );
        console.log("Stripe Transfer Reversal Success!");
        console.log("Reversal ID:", reversal.id);
        console.log("Amount reversed:", reversal.amount / 100, "EUR");
    } catch (err) {
        console.error("Reversal error:", err.message);
    }
}

main();
