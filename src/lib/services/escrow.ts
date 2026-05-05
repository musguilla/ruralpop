import { createClient } from "@/utils/supabase/server";
import stripe from "@/lib/stripe";
import { slugify } from "@/utils/seoUtils";
import { encodeId } from "@/utils/idUtils";

/**
 * Calculates the Ruralpop protection fee in cents based on the progressive tiers.
 * 
 * - 0 € – 5 € → 0,40 € fijo (0 - 500 cents -> 40 cents)
 * - 6 € – 10 € → 0,50 € fijo (501 - 1000 cents -> 50 cents)
 * - 11 € – 50 € → 1,50 € fijo (1001 - 5000 cents -> 150 cents)
 * - 51 € – 300 € → 4% (5001 - 30000 cents -> 4%)
 * - 300 € – 1.000 € → 3% (30001 - 100000 cents -> 3%)
 * - 1.000,01 € a 5.000 € → 2,2% (100001 - 500000 cents -> 2.2%)
 * - Más de 5.000 € → 2% (> 500000 cents -> 2%)
 */
export function calculateRuralpopFee(amountCents: number): number {
  if (amountCents <= 500) return 40;
  if (amountCents <= 1000) return 50;
  if (amountCents <= 5000) return 150;
  if (amountCents <= 30000) return Math.round(amountCents * 0.04);
  if (amountCents <= 100000) return Math.round(amountCents * 0.03);
  if (amountCents <= 500000) return Math.round(amountCents * 0.022);
  return Math.round(amountCents * 0.02);
}

export async function createEscrowCheckout(listingId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // 1. Fetch listing and verify seller
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(`
      id, title, price, shipping_price, image_urls, user_id, 
      users:user_id ( id, email, name, stripe_customer_id )
    `)
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  // Hack for TS since join typing might not be strict
  const seller = listing.users as any;
  if (!seller || !['testpro@ruralpop.com', 'hildegartbaquero@gmail.com'].includes(seller.email?.toLowerCase().trim() || '')) {
    throw new Error("Escrow not available for this seller");
  }

  if (seller.id === user.id) {
    throw new Error("Cannot buy your own listing");
  }

  // 2. Fetch professional wallet
  // We must use admin client because RLS might prevent buyers from reading other users' wallets
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("professional_wallets")
    .select("stripe_connected_account_id")
    .eq("user_id", seller.id)
    .single();

  if (walletError || !wallet?.stripe_connected_account_id) {
    throw new Error("El vendedor aún no ha configurado sus pagos de forma segura.");
  }

  // Check if charges are enabled
  const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
  if (!account.charges_enabled) {
    throw new Error("El vendedor aún no ha completado la configuración para recibir pagos.");
  }

  // 3. Calculate amounts
  const priceCents = Math.round(listing.price * 100);
  const shippingCents = Math.round((listing.shipping_price || 0) * 100);
  const feeCents = calculateRuralpopFee(priceCents);
  const sellerNetCents = priceCents + shippingCents;
  const totalCents = sellerNetCents + feeCents; // Buyer pays product + shipping + fee
  // Wait, standard marketplace: Buyer pays price. If Buyer pays fee on top, total = price + fee.
  // The user said: "Mostrar precio del producto. Mostrar Comisión. Mostrar total a pagar." This implies Buyer pays fee on top.
  // BUT then "Application fee amount" is usually deducted from the payment.
  // If buyer pays Total = Price + Fee. 
  // Let's create an order in our DB first.

  const listingSlug = slugify(listing.title);
  const shortId = encodeId(listing.id);
  const fullListingPath = `/anuncio/${listingSlug}-${shortId}`;

  const orderId = crypto.randomUUID(); // Generate id for tracking
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ruralpop.com';
  const stripeSuccessUrl = process.env.STRIPE_ESCROW_SUCCESS_URL || `${baseUrl}/checkout/escrow/success?session_id={CHECKOUT_SESSION_ID}`;
  const stripeCancelUrl = process.env.STRIPE_ESCROW_CANCEL_URL || `${baseUrl}${fullListingPath}`;

  // 4. Create Stripe Checkout Session
  // Using Separate Charges and Transfers. 
  // We charge the buyer the total amount. Funds go to Platform. 
  // We transfer `priceCents` to the seller later.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: listing.title,
            images: listing.image_urls?.length ? [listing.image_urls[0]] : undefined,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: shippingCents > 0 ? "Envío" : "Protección de Compra Segura Ruralpop",
          },
          unit_amount: shippingCents > 0 ? shippingCents + feeCents : feeCents,
        },
        quantity: 1,
      }
    ],
    payment_intent_data: {
      transfer_group: `escrow_${orderId}`,
    },
    success_url: stripeSuccessUrl,
    cancel_url: stripeCancelUrl,
    metadata: {
      escrow_order_id: orderId,
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: seller.id,
    }
  });

  // 5. Save order in DB
  const { error: insertError } = await supabaseAdmin
    .from("escrow_orders")
    .insert({
      id: orderId,
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: seller.id,
      seller_email: seller.email,
      gross_amount_cents: totalCents,
      ruralpop_fee_cents: feeCents,
      seller_net_amount_cents: sellerNetCents,
      stripe_checkout_session_id: session.id,
      stripe_connected_account_id: wallet.stripe_connected_account_id,
      status: "pending_checkout"
    });

  if (insertError) {
    throw new Error(`Failed to create order: ${insertError.message}`);
  }

  return { sessionId: session.id, url: session.url };
}

export async function createEscrowPaymentIntentNative(listingId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  // 1. Fetch listing and verify seller
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(`
      id, title, price, shipping_price, image_urls, user_id, 
      users:user_id ( id, email, name, stripe_customer_id )
    `)
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found");
  }

  const seller = listing.users as any;
  if (!seller || !['testpro@ruralpop.com', 'hildegartbaquero@gmail.com'].includes(seller.email?.toLowerCase().trim() || '')) {
    throw new Error("Escrow not available for this seller");
  }

  if (seller.id === user.id) {
    throw new Error("Cannot buy your own listing");
  }

  // 2. Fetch professional wallet
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("professional_wallets")
    .select("stripe_connected_account_id")
    .eq("user_id", seller.id)
    .single();

  if (walletError || !wallet?.stripe_connected_account_id) {
    throw new Error("El vendedor aún no ha configurado sus pagos de forma segura.");
  }

  const account = await stripe.accounts.retrieve(wallet.stripe_connected_account_id);
  if (!account.charges_enabled) {
    throw new Error("El vendedor aún no ha completado la configuración para recibir pagos.");
  }

  // 3. Calculate amounts
  const priceCents = Math.round(listing.price * 100);
  const shippingCents = Math.round((listing.shipping_price || 0) * 100);
  const feeCents = calculateRuralpopFee(priceCents);
  const sellerNetCents = priceCents + shippingCents;
  const totalCents = sellerNetCents + feeCents;

  const orderId = crypto.randomUUID();

  // 4. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      payment_method_types: ['card'],
      transfer_group: `escrow_${orderId}`,
      metadata: {
          escrow_order_id: orderId,
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: seller.id,
      }
  });

  // 5. Save order in DB
  const { error: insertError } = await supabaseAdmin
    .from("escrow_orders")
    .insert({
      id: orderId,
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: seller.id,
      seller_email: seller.email,
      gross_amount_cents: totalCents,
      ruralpop_fee_cents: feeCents,
      seller_net_amount_cents: sellerNetCents,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_connected_account_id: wallet.stripe_connected_account_id,
      status: "pending_checkout"
    });

  if (insertError) {
    throw new Error(`Failed to create order: ${insertError.message}`);
  }

  return { clientSecret: paymentIntent.client_secret, orderId };
}

export async function confirmEscrowReception(orderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthenticated");

  const { data: order, error: orderError } = await supabase
    .from("escrow_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("Order not found");
  if (order.buyer_id !== user.id) throw new Error("Unauthorized");
  if (order.status !== "paid_held" && order.status !== "awaiting_delivery") {
    throw new Error("Order cannot be confirmed at this stage");
  }

  // Use Admin Client to bypass RLS for updates
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Mark as confirmed
  const { error: updateError } = await supabaseAdmin
    .from("escrow_orders")
    .update({ 
      status: "buyer_confirmed", 
      buyer_confirmed_at: new Date().toISOString() 
    })
    .eq("id", orderId);

  if (updateError) throw new Error("Failed to confirm order");

  // Call release logic
  await releaseEscrowPayout(orderId);

  return { success: true };
}

export async function releaseEscrowPayout(orderId: string) {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: order } = await supabaseAdmin
    .from("escrow_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "buyer_confirmed") return;

  try {
    // Perform Stripe Transfer
    const transfer = await stripe.transfers.create({
      amount: order.seller_net_amount_cents,
      currency: "eur",
      destination: order.stripe_connected_account_id,
      transfer_group: `escrow_${order.id}`,
      metadata: {
        escrow_order_id: order.id
      }
    });

    // Update order status
    await supabaseAdmin
      .from("escrow_orders")
      .update({
        status: "paid_out",
        stripe_transfer_id: transfer.id,
        seller_paid_at: new Date().toISOString()
      })
      .eq("id", order.id);

    // Eagerly update professional_wallets to provide instant UI feedback
    const { data: wallet } = await supabaseAdmin
      .from("professional_wallets")
      .select("id, pending_balance_cents, available_balance_cents, total_earned_cents")
      .eq("user_id", order.seller_id)
      .single();

    if (wallet) {
      // Move from pending to available
      await supabaseAdmin
        .from("professional_wallets")
        .update({
          pending_balance_cents: Math.max(0, wallet.pending_balance_cents - order.seller_net_amount_cents),
          available_balance_cents: wallet.available_balance_cents + order.seller_net_amount_cents,
          total_earned_cents: wallet.total_earned_cents + order.seller_net_amount_cents
        })
        .eq("id", wallet.id);

      // Record payout released
      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          escrow_order_id: order.id,
          type: "payout_released",
          amount_cents: order.seller_net_amount_cents,
          description: `Pago liberado por confirmación del comprador`,
        });
    }

  } catch (error: any) {
    console.error("Payout release failed", error);
    throw new Error("Payout release failed");
  }
}

export async function initiateEscrowReturn(orderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthenticated");

  const { data: order, error: orderError } = await supabase
    .from("escrow_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("Order not found");
  if (order.buyer_id !== user.id) throw new Error("Unauthorized");
  if (order.status !== "paid_held" && order.status !== "awaiting_delivery") {
    throw new Error("Return cannot be initiated at this stage");
  }

  // Use Admin Client to bypass RLS for updates
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: updateError } = await supabaseAdmin
    .from("escrow_orders")
    .update({ 
      status: "return_initiated",
    })
    .eq("id", orderId);

  if (updateError) throw new Error("Failed to initiate return");

  return { success: true };
}

export async function confirmEscrowReturn(orderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Unauthenticated");

  const { data: order, error: orderError } = await supabase
    .from("escrow_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error("Order not found");
  if (order.seller_id !== user.id) throw new Error("Unauthorized");
  if (order.status !== "return_initiated") {
    throw new Error("Return hasn't been initiated by the buyer");
  }

  if (!order.stripe_payment_intent_id) {
     throw new Error("Missing payment intent to process refund");
  }

  try {
    // Perform Stripe Refund
    await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      metadata: {
        escrow_order_id: order.id
      }
    });

    // Use Admin Client to bypass RLS for updates
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update order status
    await supabaseAdmin
      .from("escrow_orders")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString()
      })
      .eq("id", order.id);

    // Eagerly update professional_wallets to deduct the pending balance
    const { data: wallet } = await supabaseAdmin
      .from("professional_wallets")
      .select("id, pending_balance_cents")
      .eq("user_id", order.seller_id)
      .single();

    if (wallet) {
      await supabaseAdmin
        .from("professional_wallets")
        .update({
          pending_balance_cents: Math.max(0, wallet.pending_balance_cents - order.seller_net_amount_cents),
        })
        .eq("id", wallet.id);
        
      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          escrow_order_id: order.id,
          type: "refund_processed",
          amount_cents: -order.seller_net_amount_cents,
          description: `Devolución al comprador procesada`,
        });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Refund failed", error);
    throw new Error("Refund failed");
  }
}

export async function autoReleaseExpiredEscrows() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Find all orders that are paid_held and older than 7 days
  const { data: orders, error } = await supabaseAdmin
    .from("escrow_orders")
    .select("id")
    .eq("status", "paid_held")
    .lt("created_at", sevenDaysAgo);

  if (error) {
    console.error("Failed to fetch expired escrows:", error);
    return { success: false, error: error.message };
  }

  let releasedCount = 0;

  for (const order of orders || []) {
    console.log(`Auto-releasing escrow order ${order.id}...`);
    try {
      // 1. Mark as buyer_confirmed (system bypass)
      await supabaseAdmin
        .from("escrow_orders")
        .update({ 
          status: "buyer_confirmed", 
          buyer_confirmed_at: new Date().toISOString() 
        })
        .eq("id", order.id);

      // 2. Release payout to the seller
      await releaseEscrowPayout(order.id);
      console.log(`✅ Auto-released escrow order ${order.id}`);
      releasedCount++;
    } catch (err) {
      console.error(`❌ Failed to auto-release escrow order ${order.id}:`, err);
    }
  }
  
  return { success: true, releasedCount };
}
