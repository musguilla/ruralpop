export type SourceType = 'api' | 'csv' | 'html' | 'pdf' | 'manual';
export type UnitType = 'eur_unidad' | 'eur_kg_vivo' | 'eur_kg_canal' | 'eur_arroba' | 'other';
export type TrendType = 'up' | 'down' | 'stable' | 'unknown';
export type SegmentType = 'vida' | 'carne' | 'canal' | 'abasto' | 'recría' | 'leche';

export interface MarketSource {
    id: string;
    name: string;
    province: string;
    region: string;
    source_url: string;
    source_type: SourceType;
    active: boolean;
    last_success_at?: Date | string;
    last_error_at?: Date | string;
}

export interface LivestockPrice {
    id?: string;
    market_source_id: string;
    date: Date | string;
    species: string; // usually 'bovino'
    segment: SegmentType;
    category_name: string;
    normalized_category: string;
    breed?: string;
    sex?: string;
    age_range?: string;
    weight_min?: number;
    weight_max?: number;
    price_min?: number;
    price_max?: number;
    price_avg: number;
    unit: UnitType;
    previous_price?: number;
    variation_abs?: number;
    variation_pct?: number;
    trend: TrendType;
    source_url?: string;
    raw_source_id?: string;
    confidence_score?: number;
    reviewed?: boolean;
}

export interface RawMarketSnapshot {
    id?: string;
    market_source_id: string;
    fetched_at: Date | string;
    source_url: string;
    content_type: string;
    raw_content: string;
    parsed_successfully: boolean;
    parser_version: string;
    checksum?: string;
}

export interface ETLParserResult {
    prices: Omit<LivestockPrice, 'id' | 'market_source_id' | 'created_at' | 'updated_at'>[];
    rawContent: string;
    contentType: string;
}
