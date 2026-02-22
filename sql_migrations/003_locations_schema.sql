-- 1. Create Countries Table (ISO 3166-1 alpha-2 code as primary key)
CREATE TABLE public.countries (
    id VARCHAR(2) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Provinces Table
CREATE TABLE public.provinces (
    id INT PRIMARY KEY,
    country_id VARCHAR(2) REFERENCES public.countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Municipalities Table
CREATE TABLE public.municipalities (
    id INT PRIMARY KEY,
    province_id INT REFERENCES public.provinces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Read Policies (Everyone can read locations)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.countries FOR SELECT USING (true);

CREATE POLICY "Public provinces are viewable by everyone." 
ON public.provinces FOR SELECT USING (true);

CREATE POLICY "Public municipalities are viewable by everyone." 
ON public.municipalities FOR SELECT USING (true);

-- 6. Add references to listings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listings' AND column_name='province_id') THEN
        ALTER TABLE public.listings ADD COLUMN province_id INT REFERENCES public.provinces(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listings' AND column_name='municipality_id') THEN
        ALTER TABLE public.listings ADD COLUMN municipality_id INT REFERENCES public.municipalities(id) ON DELETE SET NULL;
    END IF;
END $$;
