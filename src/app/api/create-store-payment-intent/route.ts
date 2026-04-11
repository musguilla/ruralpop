import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, shippingDetails } = body;

        if (!items || items.length === 0) {
            return new NextResponse("Invalid request: No items", { status: 400 });
        }

        // Calculate order total securely on server to prevent manipulation
        // For now, all hats are 15 EUR + fixed shipping 5.50 EUR
        let totalAmount = 5.5; // Starts with shipping cost
        items.forEach((item: any) => {
            totalAmount += (15.00 * item.quantity); // Hardware price validation!
        });

        // Create a PaymentIntent with the order amount and currency directly
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // in cents
            currency: "eur",
            payment_method_types: ['card'],
            metadata: {
                type: 'store_order',
                customerName: shippingDetails.name,
                customerEmail: shippingDetails.email,
                itemsSummary: items.map((i: any) => `${i.quantity}x ${i.title}`).join(', ')
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            totalAmount: totalAmount
        });
    } catch (error: unknown) {
        console.error("Stripe Error:", error);
        return new NextResponse(error instanceof Error ? error.message : "Internal Error", { status: 500 });
    }
}
