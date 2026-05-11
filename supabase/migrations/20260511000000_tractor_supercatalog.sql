-- FASE 1B: Base de Datos para Supercatálogo de Tractores

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: tractor_brands
CREATE TABLE IF NOT EXISTS tractor_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    country TEXT,
    founded_year INTEGER,
    logo_url TEXT,
    hero_image_url TEXT,
    short_description TEXT,
    long_description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_h1 TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: tractor_models
CREATE TABLE IF NOT EXISTS tractor_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES tractor_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    series TEXT,
    generation TEXT,
    production_years TEXT,
    year_from INTEGER,
    year_to INTEGER,
    power_hp_min NUMERIC,
    power_hp_max NUMERIC,
    power_kw_min NUMERIC,
    power_kw_max NUMERIC,
    engine TEXT,
    engine_brand TEXT,
    cylinders INTEGER,
    displacement_l NUMERIC,
    transmission TEXT,
    gears TEXT,
    max_speed_kmh NUMERIC,
    fuel_tank_l NUMERIC,
    hydraulic_flow_l_min NUMERIC,
    weight_kg NUMERIC,
    wheelbase_mm NUMERIC,
    lift_capacity_kg NUMERIC,
    traction TEXT,
    cabin TEXT,
    emissions_standard TEXT,
    uses TEXT[],
    crops TEXT[],
    segment TEXT,
    description TEXT,
    technical_summary TEXT,
    strengths TEXT[],
    common_uses TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    seo_h1 TEXT,
    canonical_url TEXT,
    is_active BOOLEAN DEFAULT true,
    data_quality_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, slug)
);

-- Tabla: tractor_catalogs
CREATE TABLE IF NOT EXISTS tractor_catalogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES tractor_brands(id) ON DELETE CASCADE,
    model_id UUID REFERENCES tractor_models(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'pdf',
    document_type TEXT, -- catalogo, ficha-tecnica, manual, etc.
    language TEXT DEFAULT 'es',
    year INTEGER,
    pages INTEGER,
    source_url TEXT,
    is_official BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: tractor_model_aliases
CREATE TABLE IF NOT EXISTS tractor_model_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES tractor_models(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_id, slug)
);

-- Tabla: tractor_seo_entities
CREATE TABLE IF NOT EXISTS tractor_seo_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- potencia, uso, cultivo, etc.
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, slug)
);

-- Tabla: tractor_page_quality
CREATE TABLE IF NOT EXISTS tractor_page_quality (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_type TEXT NOT NULL, -- brand, model, etc.
    entity_id UUID,
    url_path TEXT UNIQUE NOT NULL,
    has_technical_data BOOLEAN DEFAULT false,
    has_catalogs BOOLEAN DEFAULT false,
    has_ads BOOLEAN DEFAULT false,
    ads_count INTEGER DEFAULT 0,
    content_word_count INTEGER DEFAULT 0,
    faq_count INTEGER DEFAULT 0,
    internal_links_count INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    indexable BOOLEAN DEFAULT false,
    canonical_url TEXT,
    last_checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Lectura pública para todos
ALTER TABLE tractor_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_model_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_seo_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_page_quality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for tractor_brands" ON tractor_brands FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_models" ON tractor_models FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_catalogs" ON tractor_catalogs FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_model_aliases" ON tractor_model_aliases FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_seo_entities" ON tractor_seo_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_page_quality" ON tractor_page_quality FOR SELECT USING (true);

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_tractor_brands_slug ON tractor_brands(slug);
CREATE INDEX IF NOT EXISTS idx_tractor_models_brand_slug ON tractor_models(brand_id, slug);
CREATE INDEX IF NOT EXISTS idx_tractor_model_aliases_slug ON tractor_model_aliases(slug);
CREATE INDEX IF NOT EXISTS idx_tractor_catalogs_model_id ON tractor_catalogs(model_id);
