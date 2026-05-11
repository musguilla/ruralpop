import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateTractorFriendlySlug } from '../src/lib/tractores-data';
import { 
    generateFeatureH1, 
    generateFeatureIntro, 
    generateFeatureSeoText, 
    generateFeatureFaqs, 
    generateFeatureMetaTitle, 
    generateFeatureMetaDescription,
    FeatureType
} from '../src/lib/seo/tractor-feature-content';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BLACKLIST = [
    '', '-', 'n/a', 'na', 'null', 'undefined', 'unknown', 'desconocido', 'sin datos', 'varios', 'otros'
];

interface NormalizationConfig {
    featureType: FeatureType;
    dbField: string;
    isNumeric?: boolean;
    isArray?: boolean;
    ranges?: { name: string, min: number, max: number }[];
}

const CONFIGS: NormalizationConfig[] = [
    {
        featureType: 'power_range',
        dbField: 'power_hp_max',
        isNumeric: true,
        ranges: [
            { name: 'menos de 50 CV', min: 0, max: 49 },
            { name: '50 a 75 CV', min: 50, max: 74 },
            { name: '75 a 100 CV', min: 75, max: 99 },
            { name: '100 a 125 CV', min: 100, max: 124 },
            { name: '125 a 150 CV', min: 125, max: 149 },
            { name: '150 a 200 CV', min: 150, max: 199 },
            { name: '200 a 300 CV', min: 200, max: 299 },
            { name: 'más de 300 CV', min: 300, max: 9999 }
        ]
    },
    {
        featureType: 'fuel_tank',
        dbField: 'fuel_tank_l',
        isNumeric: true,
        ranges: [
            { name: 'menos de 80 litros', min: 0, max: 79 },
            { name: '80 a 120 litros', min: 80, max: 119 },
            { name: '120 a 180 litros', min: 120, max: 179 },
            { name: '180 a 250 litros', min: 180, max: 249 },
            { name: 'más de 250 litros', min: 250, max: 9999 }
        ]
    },
    {
        featureType: 'weight',
        dbField: 'weight_kg',
        isNumeric: true,
        ranges: [
            { name: 'menos de 2000 kg', min: 0, max: 1999 },
            { name: '2000 a 3500 kg', min: 2000, max: 3499 },
            { name: '3500 a 5000 kg', min: 3500, max: 4999 },
            { name: '5000 a 7000 kg', min: 5000, max: 6999 },
            { name: 'más de 7000 kg', min: 7000, max: 99999 }
        ]
    },
    {
        featureType: 'speed',
        dbField: 'max_speed_kmh',
        isNumeric: true,
        ranges: [
            { name: 'menos de 30 kmh', min: 0, max: 29 },
            { name: '30 a 40 kmh', min: 30, max: 39 },
            { name: '40 a 50 kmh', min: 40, max: 50 },
            { name: 'más de 50 kmh', min: 51, max: 999 }
        ]
    },
    { featureType: 'engine', dbField: 'engine_brand' }, // Normalizing by brand for simplicity right now
    { featureType: 'transmission', dbField: 'transmission' },
    { featureType: 'use', dbField: 'uses', isArray: true },
    { featureType: 'crop', dbField: 'crops', isArray: true },
    { featureType: 'segment', dbField: 'segment' },
    { featureType: 'traction', dbField: 'traction' },
];

function isClean(val: string | null | undefined): boolean {
    if (!val) return false;
    const lower = val.toString().toLowerCase().trim();
    if (BLACKLIST.includes(lower)) return false;
    return true;
}

function getRange(val: number, ranges: any[]): any {
    if (!val || isNaN(val)) return null;
    for (const r of ranges) {
        if (val >= r.min && val <= r.max) return r;
    }
    return null;
}

async function run() {
    console.log('Fetching all active models...');
    let allModels: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    while (hasMore) {
        const { data: modelsChunk, error } = await supabase
            .from('tractor_models')
            .select(`
                id, 
                power_hp_min, power_hp_max, 
                year_from, year_to,
                fuel_tank_l, weight_kg, max_speed_kmh,
                engine_brand, transmission, uses, crops, segment, traction,
                brand:tractor_brands(id, name)
            `)
            .eq('is_active', true)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !modelsChunk) {
            console.error('Error fetching models:', error);
            return;
        }

        allModels = allModels.concat(modelsChunk);
        
        if (modelsChunk.length < pageSize) {
            hasMore = false;
        } else {
            page++;
        }
    }
    
    const models = allModels;
    console.log(`Analyzing ${models.length} models...`);

    const groupedData: Record<string, {
        featureType: FeatureType,
        name: string,
        slug: string,
        models: any[],
        brands: Set<string>,
        minPower: number,
        maxPower: number,
        minYear: number,
        maxYear: number
    }> = {};

    // 1. Group models
    for (const model of models) {
        for (const config of CONFIGS) {
            const val = model[config.dbField as keyof typeof model];
            if (!val) continue;

            const addGroup = (name: string, featureType: FeatureType) => {
                const slug = generateTractorFriendlySlug(name);
                const key = `${featureType}_${slug}`;
                
                if (!groupedData[key]) {
                    groupedData[key] = {
                        featureType,
                        name,
                        slug,
                        models: [],
                        brands: new Set(),
                        minPower: 9999,
                        maxPower: 0,
                        minYear: 9999,
                        maxYear: 0
                    };
                }
                
                const group = groupedData[key];
                group.models.push(model.id);
                if (model.brand && !Array.isArray(model.brand)) {
                    group.brands.add(model.brand.name);
                }
                
                const hpMin = model.power_hp_min || model.power_hp_max || 0;
                const hpMax = model.power_hp_max || model.power_hp_min || 0;
                if (hpMin > 0 && hpMin < group.minPower) group.minPower = hpMin;
                if (hpMax > 0 && hpMax > group.maxPower) group.maxPower = hpMax;
                
                const yrFrom = model.year_from || 0;
                const yrTo = model.year_to || 0;
                if (yrFrom > 0 && yrFrom < group.minYear) group.minYear = yrFrom;
                if (yrTo > 0 && yrTo > group.maxYear) group.maxYear = yrTo;
            };

            if (config.isNumeric && config.ranges) {
                const range = getRange(val as number, config.ranges);
                if (range) addGroup(range.name, config.featureType);
            } else if (config.isArray) {
                if (Array.isArray(val)) {
                    for (const v of val) {
                        if (isClean(v)) addGroup(v, config.featureType);
                    }
                }
            } else {
                if (isClean(val as string)) addGroup(val as string, config.featureType);
            }
        }
    }

    console.log(`Generated ${Object.keys(groupedData).length} unique feature pages.`);
    
    // 2. Generate and Insert
    let createdCount = 0;
    let indexableCount = 0;

    for (const [key, data] of Object.entries(groupedData)) {
        const modelsCount = data.models.length;
        const brandsCount = data.brands.size;
        
        // Strict indexation rules
        let isIndexable = false;
        if (modelsCount >= 5 && brandsCount >= 2) {
            isIndexable = true;
        } else if ((data.featureType === 'use' || data.featureType === 'power_range') && modelsCount >= 3) {
            // Strategic exception
            isIndexable = true;
        }

        const topBrands = Array.from(data.brands);
        const stats = {
            modelsCount,
            brandsCount,
            minPower: data.minPower === 9999 ? undefined : data.minPower,
            maxPower: data.maxPower === 0 ? undefined : data.maxPower,
            minYear: data.minYear === 9999 ? undefined : data.minYear,
            maxYear: data.maxYear === 0 ? undefined : data.maxYear,
            topBrands
        };

        const title = generateFeatureMetaTitle(data.featureType, data.name);
        const description = generateFeatureMetaDescription(data.featureType, data.name, stats);
        const h1 = generateFeatureH1(data.featureType, data.name);
        const introText = generateFeatureIntro(data.featureType, data.name, stats);
        const seoText = isIndexable ? generateFeatureSeoText(data.featureType, data.name, stats) : null;
        
        const urlPath = `/tractores/${data.featureType.replace('_', '-')}/${data.slug}`;

        // Insert/Upsert Page
        const { data: pageResult, error: pageError } = await supabase
            .from('tractor_feature_pages')
            .upsert({
                feature_type: data.featureType,
                name: data.name,
                slug: data.slug,
                url_path: urlPath,
                title,
                h1,
                intro_text: introText,
                seo_text: seoText,
                seo_title: title,
                seo_description: description,
                canonical_url: urlPath,
                models_count: modelsCount,
                brands_count: brandsCount,
                indexable: isIndexable,
                last_generated_at: new Date().toISOString()
            }, { onConflict: 'feature_type, slug' })
            .select('id')
            .single();

        if (pageError || !pageResult) {
            console.error(`Error saving page ${urlPath}:`, pageError);
            continue;
        }

        const pageId = pageResult.id;

        // Clear old models for this page
        await supabase.from('tractor_feature_page_models').delete().eq('feature_page_id', pageId);

        // Insert relationships in chunks
        const rels = data.models.map(mId => ({
            feature_page_id: pageId,
            model_id: mId,
            match_reason: 'Automated ETL'
        }));
        
        const chunkSize = 500;
        for (let i = 0; i < rels.length; i += chunkSize) {
            await supabase.from('tractor_feature_page_models').insert(rels.slice(i, i + chunkSize));
        }

        createdCount++;
        if (isIndexable) indexableCount++;
    }

    console.log(`\n=== REPORT ===`);
    console.log(`Total Pages Processed: ${createdCount}`);
    console.log(`Indexable Pages: ${indexableCount}`);
    console.log(`NoIndex Pages: ${createdCount - indexableCount}`);
}

run();
