import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateTractorFriendlySlug } from '../src/lib/tractores-data';
import { LOCATIONS } from '../src/constants/locations';
import {
    generateCombinationH1,
    generateCombinationIntro,
    generateCombinationSeoText,
    generateCombinationMetaTitle,
    generateCombinationMetaDescription,
    FeatureType
} from '../src/lib/seo/tractor-feature-content';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PROVINCES = LOCATIONS.filter(l => l.type === 'province');

// We use the same grouping logic as feature-pages
const BLACKLIST = ['', '-', 'n/a', 'na', 'null', 'undefined', 'unknown', 'desconocido', 'sin datos', 'varios', 'otros'];

const CONFIGS = [
    {
        featureType: 'power_range' as FeatureType,
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
    { featureType: 'transmission' as FeatureType, dbField: 'transmission' },
    { featureType: 'use' as FeatureType, dbField: 'uses', isArray: true },
    { featureType: 'crop' as FeatureType, dbField: 'crops', isArray: true },
    { featureType: 'segment' as FeatureType, dbField: 'segment' }
];

function isClean(val: any): boolean {
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

function getFeatureSlug(featureType: string): string {
    if (featureType === 'power_range') return 'potencia';
    if (featureType === 'engine') return 'motor';
    if (featureType === 'fuel_tank') return 'deposito';
    if (featureType === 'weight') return 'peso';
    if (featureType === 'speed') return 'velocidad';
    if (featureType === 'transmission') return 'transmision';
    if (featureType === 'use') return 'uso';
    if (featureType === 'crop') return 'cultivo';
    if (featureType === 'segment') return 'segmento';
    return featureType;
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
                id, power_hp_min, power_hp_max, transmission, uses, crops, segment,
                brand:tractor_brands!inner(id, name, slug)
            `)
            .eq('is_active', true)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !modelsChunk) {
            console.error('Error fetching models:', error);
            return;
        }

        allModels = allModels.concat(modelsChunk);
        if (modelsChunk.length < pageSize) hasMore = false;
        else page++;
    }

    const models = allModels;
    console.log(`Analyzing ${models.length} models for combinations...`);

    // Fetch existing feature pages to link them
    const { data: featurePages } = await supabase.from('tractor_feature_pages').select('id, feature_type, slug');
    const featureMap = new Map();
    if (featurePages) {
        featurePages.forEach(fp => {
            featureMap.set(`${fp.feature_type}_${fp.slug}`, fp.id);
        });
    }

    // We will simulate ads locally or assume 0 for now (to protect indexation).
    // The user rules: "Para provincia, indexar solo si hay anuncios reales o suficientes modelos + texto local."
    // Let's assume we don't have ads data here, so we will only index provinces if modelsCount >= 5.

    const combinations: Record<string, any> = {};

    // Grouping Models
    for (const model of models) {
        if (!model.brand || Array.isArray(model.brand)) continue;
        const brand = model.brand;

        const processFeature = (featureName: string, featureType: FeatureType) => {
            const featureSlug = generateTractorFriendlySlug(featureName);
            const routeFeatureType = getFeatureSlug(featureType);
            const baseFeatureKey = `${featureType}_${featureSlug}`;
            const featureId = featureMap.get(baseFeatureKey);

            // A) Brand + Feature
            const keyA = `brand_feature_${brand.id}_${baseFeatureKey}`;
            if (!combinations[keyA]) {
                combinations[keyA] = {
                    type: 'brand_feature',
                    brandId: brand.id,
                    brandName: brand.name,
                    brandSlug: brand.slug,
                    featureId: featureId,
                    featureName: featureName,
                    featureType: featureType,
                    routeFeatureType: routeFeatureType,
                    featureSlug: featureSlug,
                    models: new Set()
                };
            }
            combinations[keyA].models.add(model.id);

            // B) Feature + Province
            // We only generate for power_range and use for now (as per user instructions)
            if (featureType === 'power_range' || featureType === 'use') {
                for (const prov of PROVINCES) {
                    const provSlug = generateTractorFriendlySlug(prov.name);
                    const keyB = `feature_province_${baseFeatureKey}_${prov.id}`;
                    if (!combinations[keyB]) {
                        combinations[keyB] = {
                            type: 'feature_province',
                            featureId: featureId,
                            featureName: featureName,
                            featureType: featureType,
                            routeFeatureType: routeFeatureType,
                            featureSlug: featureSlug,
                            provinceId: prov.id,
                            provinceName: prov.name,
                            provinceSlug: provSlug,
                            models: new Set() // All models matching the feature apply to the province conceptually
                        };
                    }
                    combinations[keyB].models.add(model.id);
                }
            }
        };

        // Process features for this model
        for (const config of CONFIGS) {
            const val = model[config.dbField as keyof typeof model];
            if (!val) continue;

            if (config.isNumeric && config.ranges) {
                const range = getRange(val as number, config.ranges);
                if (range) processFeature(range.name, config.featureType);
            } else if (config.isArray) {
                if (Array.isArray(val)) {
                    for (const v of val) {
                        if (isClean(v)) processFeature(v, config.featureType);
                    }
                }
            } else {
                if (isClean(val as string)) processFeature(val as string, config.featureType);
            }
        }

        // C) Brand + Province
        for (const prov of PROVINCES) {
            const provSlug = generateTractorFriendlySlug(prov.name);
            const keyC = `brand_province_${brand.id}_${prov.id}`;
            if (!combinations[keyC]) {
                combinations[keyC] = {
                    type: 'brand_province',
                    brandId: brand.id,
                    brandName: brand.name,
                    brandSlug: brand.slug,
                    provinceId: prov.id,
                    provinceName: prov.name,
                    provinceSlug: provSlug,
                    models: new Set()
                };
            }
            combinations[keyC].models.add(model.id);
        }
    }

    console.log(`Generated ${Object.keys(combinations).length} cross-combinations in memory.`);

    let processed = 0;
    let indexableCount = 0;
    let noindexCount = 0;
    let discardedCount = 0;

    const upsertBuffer = [];
    const modelsBuffer = [];

    for (const data of Object.values(combinations)) {
        const modelsCount = data.models.size;
        let isIndexable = false;

        // Rules
        if (data.type === 'brand_feature') {
            if (modelsCount >= 2) isIndexable = true;
        } else if (data.type === 'feature_province' || data.type === 'brand_province') {
            // "Para provincia, indexar solo si hay anuncios reales o suficientes modelos + texto local."
            // Since we don't dynamically check ads here, we require a minimum of 8 models to be indexable globally,
            // or we default to noindex. Let's use 5 models as a conservative threshold for now.
            if (modelsCount >= 5) isIndexable = true;
        }

        // If it's a province combination with very few models, we just discard to avoid DB bloat
        if (modelsCount === 0 || (data.type !== 'brand_feature' && modelsCount < 2)) {
            discardedCount++;
            continue;
        }

        let urlPath = '';
        if (data.type === 'brand_feature') {
            urlPath = `/tractores/${data.brandSlug}/${data.routeFeatureType}/${data.featureSlug}`;
        } else if (data.type === 'feature_province') {
            urlPath = `/tractores/${data.routeFeatureType}/${data.featureSlug}/${data.provinceSlug}`;
        } else if (data.type === 'brand_province') {
            urlPath = `/tractores/${data.brandSlug}/provincia/${data.provinceSlug}`;
        }

        const stats = { modelsCount, adsCount: 0 };
        const title = generateCombinationMetaTitle(data.type, data.featureName, data.featureType, data.brandName, data.provinceName);
        const description = generateCombinationMetaDescription(data.type, data.featureName, data.featureType, stats, data.brandName, data.provinceName);
        const h1 = generateCombinationH1(data.type, data.featureName, data.featureType, data.brandName, data.provinceName);
        const introText = generateCombinationIntro(data.type, data.featureName, data.featureType, stats, data.brandName, data.provinceName);
        const seoText = isIndexable ? generateCombinationSeoText(data.type, data.featureName, data.featureType, stats, data.brandName, data.provinceName) : null;

        const record = {
            combination_type: data.type,
            url_path: urlPath,
            brand_id: data.brandId || null,
            feature_page_id: data.featureId || null,
            province_slug: data.provinceSlug || null,
            province_name: data.provinceName || null,
            models_count: modelsCount,
            title,
            h1,
            intro_text: introText,
            seo_text: seoText,
            seo_title: title,
            seo_description: description,
            canonical_url: urlPath,
            indexable: isIndexable,
            last_generated_at: new Date().toISOString()
        };

        upsertBuffer.push({ record, models: Array.from(data.models) });

        processed++;
        if (isIndexable) indexableCount++;
        else noindexCount++;
    }

    console.log(`Ready to insert ${upsertBuffer.length} combinations.`);

    // Batch Insert
    const chunkSize = 200;
    for (let i = 0; i < upsertBuffer.length; i += chunkSize) {
        const chunk = upsertBuffer.slice(i, i + chunkSize);
        
        // 1. Upsert combinations
        const recordsToUpsert = chunk.map(c => c.record);
        const { data: upsertedData, error } = await supabase
            .from('tractor_combination_pages')
            .upsert(recordsToUpsert, { onConflict: 'url_path' })
            .select('id, url_path');

        if (error) {
            console.error('Batch upsert error:', error);
            continue;
        }

        // 2. Prepare models relationships
        const rels: any[] = [];
        if (upsertedData) {
            for (const upserted of upsertedData) {
                const original = chunk.find(c => c.record.url_path === upserted.url_path);
                if (original) {
                    original.models.forEach(mId => {
                        rels.push({
                            combination_page_id: upserted.id,
                            model_id: mId,
                            match_reason: 'Automated ETL'
                        });
                    });
                }
            }

            // Clear old relationships
            const ids = upsertedData.map(u => u.id);
            await supabase.from('tractor_combination_page_models').delete().in('combination_page_id', ids);

            // Insert new relationships
            for (let j = 0; j < rels.length; j += 1000) {
                await supabase.from('tractor_combination_page_models').insert(rels.slice(j, j + 1000));
            }
        }
        
        console.log(`Processed ${i + chunk.length} / ${upsertBuffer.length}`);
    }

    console.log(`\n=== REPORT ===`);
    console.log(`Total Combinations Processed: ${processed}`);
    console.log(`Indexable: ${indexableCount}`);
    console.log(`NoIndex: ${noindexCount}`);
    console.log(`Discarded (Low Quality): ${discardedCount}`);
}

run();
