-- Add featured columns to listings table
ALTER TABLE public.listings 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN featured_until TIMESTAMPTZ;

-- Index for better sorting performance since we'll always sort by is_featured DESC
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON public.listings(is_featured);
