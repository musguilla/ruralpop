import Stripe from "stripe";

// Utiliza un valor por defecto vacío durante el 'build' de Next.js
// para evitar el error 'Neither apiKey nor config.authenticator provided'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // @ts-ignore
    apiVersion: "2024-12-18.acacia",
});

export default stripe;
