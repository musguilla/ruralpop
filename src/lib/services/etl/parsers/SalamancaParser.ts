import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SalamancaParser {
    
    // Define the bovino categories to parse from Salamanca
    // In Salamanca, "BOVINO DE CARNE" and "BOVINO DE VIDA" are the products
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // Fetch the records from the CKAN API using the new CSV resource ID
        // limit=50000 to get all historical data since 2005 (there are around 48k bovino records)
        const url = `https://datosabiertossalamanca.es/api/3/action/datastore_search?resource_id=042beb52-4d80-4380-b073-e170364f65e7&q=BOVINO&limit=50000`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Salamanca API returned ${response.status}`);
        }
        
        const json = await response.json();
        const records = json.result?.records || [];
        
        const prices = [];
        
        for (const record of records) {
            const fechaStr = record.FECHA;
            const mesa = record.MESA;
            const producto = record.PRODUCTO;
            const categoria = record.CATEGORIA;
            const valor1Str = record.VALOR1;
            
            if (!fechaStr || !mesa || !producto || !categoria || !valor1Str) {
                continue;
            }
            
            // Only process BOVINO
            if (!mesa.toUpperCase().includes('BOVINO')) continue;
            
            const fecha = new Date(fechaStr);
            
            const productoStr = producto.trim();
            const categoriaStr = categoria.trim();
            
            const fullCategoryName = `${productoStr} - ${categoriaStr}`;
            
            // The CSV JSON returns '6,77', we need to replace comma with dot
            const valor1 = parseFloat(valor1Str.replace(',', '.'));
            
            if (isNaN(valor1) || valor1 === 0) continue; // Skip empty prices
            
            let segment: SegmentType = 'abasto';
            let unit: UnitType = 'eur_kg_vivo';
            
            if (mesa.toUpperCase().includes('VIDA')) {
                segment = 'vida';
                unit = 'eur_kg_vivo';
            } else if (mesa.toUpperCase().includes('CARNE')) {
                segment = 'carne';
                unit = 'eur_kg_canal';
            }
            
            prices.push({
                date: fecha,
                species: 'bovino',
                segment,
                category_name: fullCategoryName,
                normalized_category: SalamancaParser.normalizeCategory(fullCategoryName),
                price_avg: valor1,
                unit,
                trend: 'unknown' as TrendType, // Will be computed by ETL orchestrator comparing to DB
            });
        }
        
        return {
            prices,
            rawContent: JSON.stringify(json),
            contentType: 'application/json'
        };
    }
    
    static normalizeCategory(raw: string): string {
        const lower = raw.toLowerCase().trim();
        if (lower.includes('terner') || lower.includes('añoje') || lower.includes('erale')) {
             if (lower.includes('macho') || lower.includes('cruzado')) return 'terneros_machos';
             if (lower.includes('hembra')) return 'terneras_hembras';
             return 'terneros';
        }
        if (lower.includes('vaca')) return 'vacas_matadero';
        if (lower.includes('toro')) return 'toros';
        if (lower.includes('pastero')) return 'terneros_pasteros';
        
        return lower.replace(/[^a-z0-9]/g, '_'); // Fallback safe string
    }
}
