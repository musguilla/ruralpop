-- FASE 2: SEO Programático para Características de Tractores

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tablas de Normalización de Entidades

-- 1.1 Motor
CREATE TABLE IF NOT EXISTS tractor_engine_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    aliases TEXT[],
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tractor_model_engine_entities (
    model_id UUID REFERENCES tractor_models(id) ON DELETE CASCADE,
    engine_entity_id UUID REFERENCES tractor_engine_entities(id) ON DELETE CASCADE,
    PRIMARY KEY (model_id, engine_entity_id)
);

-- 1.2 Transmisión
CREATE TABLE IF NOT EXISTS tractor_transmission_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    aliases TEXT[],
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tractor_model_transmission_entities (
    model_id UUID REFERENCES tractor_models(id) ON DELETE CASCADE,
    transmission_entity_id UUID REFERENCES tractor_transmission_entities(id) ON DELETE CASCADE,
    PRIMARY KEY (model_id, transmission_entity_id)
);

-- 2. Páginas de Características (SEO Hubs)

CREATE TABLE IF NOT EXISTS tractor_feature_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_type TEXT NOT NULL, -- power_range, engine, transmission, fuel_tank, weight, speed, use, crop, segment, traction
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    url_path TEXT UNIQUE NOT NULL,
    
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(feature_type, slug)
);

CREATE TABLE IF NOT EXISTS tractor_feature_page_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_page_id UUID REFERENCES tractor_feature_pages(id) ON DELETE CASCADE,
    model_id UUID REFERENCES tractor_models(id) ON DELETE CASCADE,
    match_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feature_page_id, model_id)
);

-- RLS
ALTER TABLE tractor_engine_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_model_engine_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_transmission_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_model_transmission_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_feature_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractor_feature_page_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for tractor_engine_entities" ON tractor_engine_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_model_engine_entities" ON tractor_model_engine_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_transmission_entities" ON tractor_transmission_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_model_transmission_entities" ON tractor_model_transmission_entities FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_feature_pages" ON tractor_feature_pages FOR SELECT USING (true);
CREATE POLICY "Public read access for tractor_feature_page_models" ON tractor_feature_page_models FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_feature_pages_type_slug ON tractor_feature_pages(feature_type, slug);
CREATE INDEX IF NOT EXISTS idx_feature_pages_url ON tractor_feature_pages(url_path);
CREATE INDEX IF NOT EXISTS idx_feature_pages_indexable ON tractor_feature_pages(indexable);
CREATE INDEX IF NOT EXISTS idx_feature_page_models_model ON tractor_feature_page_models(model_id);
