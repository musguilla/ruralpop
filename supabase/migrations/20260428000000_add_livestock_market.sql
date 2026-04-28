-- Create ENUM types
CREATE TYPE source_type AS ENUM ('api', 'csv', 'html', 'pdf', 'manual');
CREATE TYPE unit_type AS ENUM ('eur_unidad', 'eur_kg_vivo', 'eur_kg_canal', 'eur_arroba', 'other');
CREATE TYPE trend_type AS ENUM ('up', 'down', 'stable', 'unknown');

-- Create Market Source Table
CREATE TABLE market_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    region TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_type source_type NOT NULL,
    active BOOLEAN DEFAULT true,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 5 predefined sources
INSERT INTO market_sources (id, name, province, region, source_url, source_type, active) VALUES
('b1a7d65b-e923-4c91-9c10-eb5bcbe63290', 'Lonja de Salamanca', 'Salamanca', 'Castilla y León', 'https://datosabiertossalamanca.es/dataset/cotizaciones-semanales-de-la-lonja-de-salamanca/resource/e0dcd22f-bf4b-4c97-87e4-aae2806b82e6', 'api', true),
('f1a23db6-b4d4-4a4a-9526-7db72b6c0032', 'Mercado Nacional de Ganado de Pola de Siero', 'Asturias', 'Asturias', 'https://www.ayto-siero.es/portal-de-mercado-de-ganado/', 'pdf', true),
('a2e1d75c-3f9f-43dc-8e5f-d48e0c8b6b21', 'Mercado de Ganado Santiago de Compostela', 'A Coruña', 'Galicia', 'https://santiagodecompostela.gal/es/transparencia/cotizacions-mercado-de-ganado-2026', 'pdf', true),
('8b3d87fa-21d7-4f6c-b364-e4c13a2948c2', 'Mercado de Ganado Talavera de la Reina', 'Toledo', 'Castilla-La Mancha', 'https://www.talavera-ferial.com/14055/lonja-talavera/content/14080/cotizaciones-vacuno-2026/', 'html', true),
('4d12ab5e-b2d9-4f76-92c1-d9a24c58df12', 'Lonja Agropecuaria de León', 'León', 'Castilla y León', 'https://www.lonjadeleon.es/category/cotizaciones/carne-vacuno/', 'html', true);

-- Create Livestock Price Table
CREATE TABLE livestock_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_source_id UUID NOT NULL REFERENCES market_sources(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    species TEXT NOT NULL DEFAULT 'bovino',
    segment TEXT NOT NULL, -- 'vida' | 'carne' | 'canal' | 'abasto' | 'recría' | 'leche'
    category_name TEXT NOT NULL,
    normalized_category TEXT NOT NULL,
    breed TEXT,
    sex TEXT,
    age_range TEXT,
    weight_min FLOAT,
    weight_max FLOAT,
    price_min FLOAT,
    price_max FLOAT,
    price_avg FLOAT NOT NULL,
    unit unit_type NOT NULL,
    previous_price FLOAT,
    variation_abs FLOAT,
    variation_pct FLOAT,
    trend trend_type NOT NULL DEFAULT 'unknown',
    source_url TEXT,
    raw_source_id TEXT,
    confidence_score FLOAT DEFAULT 1.0,
    reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate records for the same day, market and category
    UNIQUE (market_source_id, date, category_name, unit)
);

-- Index for efficient querying
CREATE INDEX idx_livestock_prices_date ON livestock_prices(date);
CREATE INDEX idx_livestock_prices_segment ON livestock_prices(segment);
CREATE INDEX idx_livestock_prices_normalized_category ON livestock_prices(normalized_category);

-- Create Raw Market Snapshot Table
CREATE TABLE raw_market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_source_id UUID NOT NULL REFERENCES market_sources(id) ON DELETE CASCADE,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    raw_content TEXT,
    parsed_successfully BOOLEAN NOT NULL DEFAULT false,
    parser_version TEXT NOT NULL,
    checksum TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE market_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_market_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow read access for public
CREATE POLICY "Allow public read access on market_sources"
ON market_sources FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on livestock_prices"
ON livestock_prices FOR SELECT TO public USING (true);

-- Deny public read access to raw snapshots by default (or allow for transparency)
-- We will allow it for transparency as there is no sensitive data
CREATE POLICY "Allow public read access on raw_market_snapshots"
ON raw_market_snapshots FOR SELECT TO public USING (true);

-- Allow service role to do everything
CREATE POLICY "Allow service role all on market_sources"
ON market_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all on livestock_prices"
ON livestock_prices FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role all on raw_market_snapshots"
ON raw_market_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
