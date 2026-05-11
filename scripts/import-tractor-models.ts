import * as xlsx from 'xlsx';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSlug(text: string): string {
    if (!text) return '';
    return text.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\./g, "-") // replace dots with hyphens
        .replace(/[^a-z0-9\-]/g, "-") // replace any non-alphanumeric with hyphen
        .replace(/-+/g, "-") // remove duplicate hyphens
        .replace(/^-|-$/g, ""); // trim hyphens
}

function parsePowerRange(powerStr: string | number): { min: number | null, max: number | null } {
    if (!powerStr) return { min: null, max: null };
    const str = powerStr.toString().trim();
    // E.g. "90-120" or "90 - 120" or "90"
    const match = str.match(/(\d+)\s*(?:-|a|to|y)\s*(\d+)/i);
    if (match) {
        return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
    }
    const singleMatch = str.match(/(\d+)/);
    if (singleMatch) {
        return { min: parseFloat(singleMatch[1]), max: parseFloat(singleMatch[1]) };
    }
    return { min: null, max: null };
}

function parseYears(yearsStr: string): { from: number | null, to: number | null } {
    if (!yearsStr) return { from: null, to: null };
    const str = yearsStr.toString().trim();
    const fromMatch = str.match(/^(\d{4})/);
    const toMatch = str.match(/-(\d{4})/);
    const isPresent = str.toLowerCase().includes('presente') || str.toLowerCase().includes('actual');
    
    return {
        from: fromMatch ? parseInt(fromMatch[1], 10) : null,
        to: toMatch ? parseInt(toMatch[1], 10) : (isPresent ? new Date().getFullYear() : null)
    };
}

function parseList(listStr: string): string[] {
    if (!listStr) return [];
    return listStr.toString().split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function calculateQualityScore(model: any): number {
    let score = 0;
    if (model.power_hp_min) score += 25;
    if (model.engine) score += 15;
    if (model.transmission) score += 15;
    if (model.uses && model.uses.length > 0) score += 10;
    if (model.crops && model.crops.length > 0) score += 10;
    if (model.weight_kg) score += 5;
    if (model.hydraulic_flow_l_min) score += 5;
    if (model.lift_capacity_kg) score += 5;
    if (model.fuel_tank_l) score += 5;
    if (model.max_speed_kmh) score += 5;
    return score;
}

async function run() {
    console.log("🚜 Iniciando importación de tractores...");
    
    const filePath = path.join(process.cwd(), 'public', 'modelos_tractores_2015_2026.xlsx');
    const workbook = xlsx.readFile(filePath);
    
    // Skip 'Índice' sheet (usually the first one)
    const sheetsToProcess = workbook.SheetNames.filter(name => name !== 'Índice');
    
    let totalBrandsCreated = 0;
    let totalModelsCreated = 0;
    let totalAliasesCreated = 0;
    let errors = 0;

    for (const brandName of sheetsToProcess) {
        console.log(`\n========================================`);
        console.log(`🏭 Procesando Marca: ${brandName}`);
        
        const brandSlug = generateSlug(brandName);
        
        // 1. Get or Create Brand
        let { data: brandData, error: brandError } = await supabase
            .from('tractor_brands')
            .select('*')
            .eq('slug', brandSlug)
            .single();
            
        if (brandError && brandError.code === 'PGRST116') {
            // Not found, create it
            const newBrand = {
                id: uuidv4(),
                name: brandName,
                slug: brandSlug,
                seo_title: `Tractores ${brandName}: modelos, fichas técnicas y catálogos | Ruralpop`,
                seo_description: `Consulta tractores ${brandName}, modelos, fichas técnicas, potencia, motor, transmisión, catálogos PDF y anuncios de segunda mano en Ruralpop.`
            };
            
            const { data: insertedBrand, error: insertError } = await supabase
                .from('tractor_brands')
                .insert(newBrand)
                .select()
                .single();
                
            if (insertError) {
                console.error(`❌ Error creando marca ${brandName}:`, insertError.message);
                errors++;
                continue;
            }
            brandData = insertedBrand;
            totalBrandsCreated++;
            console.log(`✅ Marca creada: ${brandName}`);
        } else if (brandError) {
            console.error(`❌ Error buscando marca ${brandName}:`, brandError.message);
            errors++;
            continue;
        } else {
            console.log(`ℹ️ Marca existente: ${brandName}`);
        }
        
        // 2. Process Models
        const sheet = workbook.Sheets[brandName];
        const data = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
        
        // Data format:
        // [0: Modelo, 1: Serie, 2: Potencia, 3: Años, 4: Motor, 5: Transmisión, 6: Peso, 7: Deposito, 8: Vel, 9: Usos, 10: Cultivos]
        const rows = data.slice(1); // skip headers
        
        console.log(`📊 Encontrados ${rows.length} modelos para ${brandName}. Procesando...`);
        
        for (const row of rows) {
            if (!row || row.length === 0 || !row[0]) continue;
            
            const modelNameRaw = row[0].toString().trim();
            const series = row[1] ? row[1].toString().trim() : null;
            const powerStr = row[2] ? row[2].toString().trim() : null;
            const yearsStr = row[3] ? row[3].toString().trim() : null;
            const engine = row[4] ? row[4].toString().trim() : null;
            const transmission = row[5] ? row[5].toString().trim() : null;
            const weightStr = row[6] ? row[6].toString().trim() : null;
            const fuelTankStr = row[7] ? row[7].toString().trim() : null;
            const speedStr = row[8] ? row[8].toString().trim() : null;
            const usesStr = row[9] ? row[9].toString().trim() : null;
            const cropsStr = row[10] ? row[10].toString().trim() : null;
            
            const power = parsePowerRange(powerStr);
            const years = parseYears(yearsStr);
            const uses = parseList(usesStr);
            const crops = parseList(cropsStr);
            
            // Clean weight, fuel, speed (extract numbers only for max if it's a range)
            const weight = weightStr ? parseFloat(weightStr.match(/\d+/) ? weightStr.match(/\d+/)[0] : 0) : null;
            const fuel = fuelTankStr ? parseFloat(fuelTankStr.match(/\d+/) ? fuelTankStr.match(/\d+/)[0] : 0) : null;
            const speed = speedStr ? parseFloat(speedStr.match(/\d+/) ? speedStr.match(/\d+/)[0] : 0) : null;
            
            // Generate primary slug
            const modelSlug = generateSlug(modelNameRaw);
            
            const modelPayload: any = {
                brand_id: brandData.id,
                name: modelNameRaw,
                slug: modelSlug,
                series: series,
                production_years: yearsStr,
                year_from: years.from,
                year_to: years.to,
                power_hp_min: power.min,
                power_hp_max: power.max,
                engine: engine,
                transmission: transmission,
                weight_kg: weight,
                fuel_tank_l: fuel,
                max_speed_kmh: speed,
                uses: uses,
                crops: crops,
                seo_title: `${brandName} ${modelNameRaw}: ficha técnica, potencia y catálogo | Ruralpop`,
                seo_description: `Consulta la ficha técnica del ${brandName} ${modelNameRaw}: potencia, motor, transmisión, peso, depósito, usos, catálogos PDF y anuncios de segunda mano.`
            };
            
            modelPayload.data_quality_score = calculateQualityScore(modelPayload);
            
            // Upsert Model
            const { data: modelData, error: modelError } = await supabase
                .from('tractor_models')
                .upsert(modelPayload, { onConflict: 'brand_id, slug' })
                .select()
                .single();
                
            if (modelError) {
                console.error(`❌ Error upserting model ${modelNameRaw}:`, modelError.message);
                errors++;
                continue;
            }
            
            totalModelsCreated++;
            
            // Generate Aliases if composite name (e.g., 5065E-5075E)
            if (modelNameRaw.includes('-') || modelNameRaw.includes('y')) {
                const parts = modelNameRaw.split(/[-y]/).map((p: string) => p.trim()).filter((p: string) => p.length > 0);
                
                for (const part of parts) {
                    const aliasSlug = generateSlug(part);
                    if (aliasSlug && aliasSlug !== modelSlug) {
                        // Upsert alias
                        const aliasPayload = {
                            model_id: modelData.id,
                            alias: part,
                            slug: aliasSlug
                        };
                        const { error: aliasError } = await supabase
                            .from('tractor_model_aliases')
                            .upsert(aliasPayload, { onConflict: 'model_id, slug' });
                            
                        if (!aliasError) {
                            totalAliasesCreated++;
                        }
                    }
                }
            }
        }
    }
    
    console.log(`\n========================================`);
    console.log(`✅ IMPORTACIÓN FINALIZADA`);
    console.log(`🏭 Marcas creadas: ${totalBrandsCreated}`);
    console.log(`🚜 Modelos procesados: ${totalModelsCreated}`);
    console.log(`🔗 Aliases creados: ${totalAliasesCreated}`);
    console.log(`❌ Errores: ${errors}`);
}

run();
