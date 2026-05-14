CREATE TABLE IF NOT EXISTS public.admin_insights_cache (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.admin_insights_cache ENABLE ROW LEVEL SECURITY;
-- Only service role can access this directly via admin client
