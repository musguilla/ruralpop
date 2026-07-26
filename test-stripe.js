const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const stripe = require('stripe')(envConfig.STRIPE_SECRET_KEY);

async function check() {
    const customers = await stripe.customers.search({
        query: "email:'mojotonio@hotmail.com'",
    });

    if (customers.data.length === 0) {
        console.log("No customer found");
        return;
    }

    const customer = customers.data[0];
    console.log("Customer ID:", customer.id);

    const pis = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 10
    });

    pis.data.forEach(pi => {
        console.log(`Payment: ${pi.id} | Amount: ${pi.amount} | Status: ${pi.status} | Created: ${new Date(pi.created * 1000).toISOString()}`);
        console.log(`  Metadata:`, pi.metadata);
    });
}
check();
