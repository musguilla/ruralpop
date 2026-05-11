-- FASE 2: Combinaciones Cruzadas para Tractores

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla Principal de Combinaciones

CREATE TABLE IF NOT EXISTS tractor_combination_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combination_type TEXT NOT NULL, -- brand_feature, feature_province, brand_province
    url_path TEXT UNIQUE NOT NULL,
    
    brand_id UUID REFERENCES tractor_brands(id) ON DELETE CASCADE,
    feature_page_id UUID REFERENCES tractor_feature_pages(id) ON DELETE CASCADE,
    
    province_slug TEXT,
    province_name TEXT,
    
    -- Textos generados dinámicamente
    title TEXT,
    h1 TEXT,
    intro_text TEXT,
    seo_text TEXT,
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    
    -- Métricas y Scoring
    models_count INTEGER DEFAULT 0,
    ads_count INTEGER DEFAULT 0,
    brands_count INTEGER DEFAULT 0,
    data_quality_score INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    indexable BOOLEAN DEFAULT false,
    
    last_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Relación de Modelos

CREATE TABLE IF NOT EXISTS tractor_combination_page_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combination_page_id UUID REFERENCES tractor_combination_pages(id) ON DELETE CASCADE,
    model_id UUID REFERENCES tractor_models(id) ON DELETE CASCADE,
    match_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(combination_page_id, model_id)
);

-- RLS
ALTER TABLE tractor_combination_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_combination_page_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for tractor_combination_pages" ON tractor_combination_pages FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_combination_page_models" ON tractor_combination_page_models FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_combination_pages_url ON tractor_combination_pages(url_path);
CREATE INDEX IF NOT EXISTS idx_combination_pages_type ON tractor_combination_pages(combination_type);
CREATE INDEX IF NOT EXISTS idx_combination_pages_indexable ON tractor_combination_pages(indexable);
CREATE INDEX IF NOT EXISTS idx_combination_page_models_model ON tractor_combination_page_models(model_id);
