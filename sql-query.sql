-- New columns for users table to support professional tier
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS commercial_name text,
ADD COLUMN IF NOT EXISTS company_description text,
ADD COLUMN IF NOT EXISTS company_address text,
ADD COLUMN IF NOT EXISTS company_zip text,
ADD COLUMN IF NOT EXISTS company_country text,
ADD COLUMN IF NOT EXISTS company_logo_url text,
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS plan_renews_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS available_bumps integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_featured integer DEFAULT 0;

-- Adjust the role check constraint if it exists (usually it doesn't in Supabase public schema by default unless explicitly set, but good to ensure 'profesional' is a valid role concept).
