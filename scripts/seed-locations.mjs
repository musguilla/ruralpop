import { createClient } from '@supabase/supabase-js';

// ─── Configuración ────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zrpucbuvojskcwrhwevv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PROVINCIAS_URL = 'https://raw.githubusercontent.com/IagoLast/pselect/master/data/provincias.json';
const MUNICIPIOS_URL = 'https://raw.githubusercontent.com/IagoLast/pselect/master/data/municipios.json';

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status} fetching ${url}`);
    return res.json();
}

async function main() {
    console.log('🌍 Iniciando la semilla de Países, Provincias y Municipios...');

    // 1. Insertar el país España
    console.log('\n[1/3] Insertando País (España)...');
    const { error: countryError } = await supabase
        .from('countries')
        .upsert({ id: 'ES', name: 'España' }, { onConflict: 'id' });

    if (countryError) {
        throw new Error(`Error insertando país: ${countryError.message}`);
    }
    console.log('✅ País insertado correctamente.');

    // 2. Obtener e insertar provincias
    console.log('\n[2/3] Obteniendo Provincias desde origen...');
    const provinciasData = await fetchJSON(PROVINCIAS_URL);

    // Formatear proivncias para upsert
    const provincesToInsert = provinciasData.map(p => ({
        id: parseInt(p.id, 10),
        country_id: 'ES',
        name: p.nm
    }));

    console.log(`      Preparando ${provincesToInsert.length} provincias...`);
    const { error: provError } = await supabase
        .from('provinces')
        .upsert(provincesToInsert, { onConflict: 'id' });

    if (provError) {
        throw new Error(`Error insertando provincias: ${provError.message}`);
    }
    console.log('✅ Provincias insertadas correctamente.');

    // 3. Obtener e insertar municipios
    console.log('\n[3/3] Obteniendo Municipios desde origen...');
    const municipiosData = await fetchJSON(MUNICIPIOS_URL);

    // Formatear municipios. El ID de la provincia son los dos primeros dígitos del ID del municipio
    const municipalitiesToInsert = municipiosData.map(m => {
        const provId = parseInt(m.id.substring(0, 2), 10);
        return {
            id: parseInt(m.id, 10),
            province_id: provId,
            name: m.nm
        };
    });

    console.log(`      Preparando ${municipalitiesToInsert.length} municipios...`);

    // Insertar en lotes de 1000 para no exceder los límites de payload de Supabase REST API
    const batchSize = 1000;
    for (let i = 0; i < municipalitiesToInsert.length; i += batchSize) {
        const batch = municipalitiesToInsert.slice(i, i + batchSize);
        const { error: muniError } = await supabase
            .from('municipalities')
            .upsert(batch, { onConflict: 'id' });

        if (muniError) {
            console.error(`❌ Error en el lote ${i} - ${i + batchSize}: ${muniError.message}`);
        } else {
            console.log(`      ✅ Lote ${i / batchSize + 1} completado (${batch.length} registros)`);
        }
    }

    console.log('\n🎉 ¡Proceso de semilla completado con éxito!');
}

main().catch(console.error);
