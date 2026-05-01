-- Add stripe_customer_id to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create Enums
CREATE TYPE escrow_order_status AS ENUM (
  'pending_checkout',
  'paid_held',
  'awaiting_delivery',
  'buyer_confirmed',
  'payout_pending',
  'paid_out',
  'refunded',
  'disputed',
  'cancelled',
  'failed'
);

CREATE TYPE wallet_transaction_type AS ENUM (
  'escrow_paid',
  'fee_charged',
  'payout_released',
  'refund',
  'adjustment'
);

-- Escrow Orders Table
CREATE TABLE public.escrow_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  seller_email TEXT NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  ruralpop_fee_cents INTEGER NOT NULL,
  seller_net_amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur' NOT NULL,
  status escrow_order_status DEFAULT 'pending_checkout'::escrow_order_status NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,
  stripe_connected_account_id TEXT,
  buyer_confirmed_at TIMESTAMPTZ,
  seller_paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  dispute_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
-- Buyers can see their own orders
CREATE POLICY "Buyers can view own escrow orders" ON public.escrow_orders FOR SELECT USING (auth.uid() = buyer_id);
-- Sellers can see their own orders
CREATE POLICY "Sellers can view own escrow orders" ON public.escrow_orders FOR SELECT USING (auth.uid() = seller_id);
-- System (service role) can do all. By default service role bypasses RLS.

-- Professional Wallets Table
CREATE TABLE public.professional_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_connected_account_id TEXT,
  available_balance_cents INTEGER DEFAULT 0 NOT NULL,
  pending_balance_cents INTEGER DEFAULT 0 NOT NULL,
  total_earned_cents INTEGER DEFAULT 0 NOT NULL,
  total_fees_paid_cents INTEGER DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'eur' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.professional_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.professional_wallets FOR SELECT USING (auth.uid() = user_id);

-- Wallet Transactions Table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.professional_wallets(id) ON DELETE CASCADE NOT NULL,
  escrow_order_id UUID REFERENCES public.escrow_orders(id) ON DELETE SET NULL,
  type wallet_transaction_type NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur' NOT NULL,
  status TEXT DEFAULT 'completed' NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (
  wallet_id IN (SELECT id FROM public.professional_wallets WHERE user_id = auth.uid())
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_escrow_orders_modtime
BEFORE UPDATE ON public.escrow_orders
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_professional_wallets_modtime
BEFORE UPDATE ON public.professional_wallets
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
