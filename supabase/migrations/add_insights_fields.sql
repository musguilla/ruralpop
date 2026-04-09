-- Añadir contador de visitas a los anuncios
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS visits_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_listings_visits ON public.listings(visits_count DESC);
CREATE INDEX IF NOT EXISTS idx_users_province ON public.users(province_id);

-- RPC para vistas
CREATE OR REPLACE FUNCTION increment_listing_visits(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET visits_count = COALESCE(visits_count, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_insights_top_provinces()
RETURNS TABLE (province_id int, users_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT u.province_id, COUNT(*) as users_count
  FROM public.users u
  WHERE u.province_id IS NOT NULL
  GROUP BY u.province_id
  ORDER BY users_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_insights_top_users_listings()
RETURNS TABLE (user_id uuid, listings_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT l.user_id, COUNT(*) as listings_count
  FROM public.listings l
  GROUP BY l.user_id
  ORDER BY listings_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_insights_top_users_chats()
RETURNS TABLE (user_id uuid, chats_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT c.userId, COUNT(*) as chats_count
  FROM (
      SELECT buyer_id as userId FROM public.chats
      UNION ALL
      SELECT seller_id as userId FROM public.chats
  ) c
  GROUP BY c.userId
  ORDER BY chats_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_insights_top_listings_likes()
RETURNS TABLE (listing_id uuid, likes_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT f.listing_id, COUNT(*) as likes_count
  FROM public.favorites f
  GROUP BY f.listing_id
  ORDER BY likes_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_insights_top_listings_chats()
RETURNS TABLE (listing_id uuid, chats_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT c.listing_id, COUNT(*) as chats_count
  FROM public.chats c
  GROUP BY c.listing_id
  ORDER BY chats_count DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
