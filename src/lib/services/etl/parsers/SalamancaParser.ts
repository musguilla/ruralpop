import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SalamancaParser {
    
    // Define the bovino categories to parse from Salamanca
    // In Salamanca, "BOVINO DE CARNE" and "BOVINO DE VIDA" are the products
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // Fetch the latest 500 records from the CKAN API
        // Ordered by _id desc to get the latest dates first
        const url = `https://datosabiertossalamanca.es/api/3/action/datastore_search?resource_id=e0dcd22f-bf4b-4c97-87e4-aae2806b82e6&limit=1000&sort=_id%20desc`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Salamanca API returned ${response.status}`);
        }
        
        const json = await response.json();
        const records = json.result?.records || [];
        
        const prices = [];
        
        // Find the latest distinct date for Bovino to avoid processing historical data pointlessly
        let latestBovinoDate: Date | null = null;
        
        for (const record of records) {
            const dataStr = record['<data>'];
            if (!dataStr) continue;
            
            // Extract using regex
            const fechaMatch = dataStr.match(/<FECHA>(.*?)<\/FECHA>/);
            const mesaMatch = dataStr.match(/<MESA>(.*?)<\/MESA>/);
            const productoMatch = dataStr.match(/<PRODUCTO>(.*?)<\/PRODUCTO>/);
            const categoriaMatch = dataStr.match(/<CATEGORIA>(.*?)<\/CATEGORIA>/);
            const valor1Match = dataStr.match(/<VALOR1>(.*?)<\/VALOR1>/);
            
            if (!fechaMatch || !mesaMatch || !productoMatch || !categoriaMatch || !valor1Match) {
                continue;
            }
            
            const mesa = mesaMatch[1];
            
            // Only process BOVINO
            if (!mesa.toUpperCase().includes('BOVINO')) continue;
            
            const fecha = new Date(fechaMatch[1]);
            
            // If we found a newer date, or if we are still on the newest date, process it
            // Assuming records are ordered descending by _id, the first bovino we see is the latest
            if (!latestBovinoDate) {
                latestBovinoDate = fecha;
            }
            
            // Only take the latest snapshot
            if (fecha.getTime() !== latestBovinoDate.getTime()) {
                continue;
            }
            
            const producto = productoMatch[1].toUpperCase();
            const categoria = categoriaMatch[1];
            const valor1 = parseFloat(valor1Match[1].replace(',', '.')); // Handle decimal comma if present
            
            if (isNaN(valor1) || valor1 === 0) continue; // Skip empty prices
            
            let segment: SegmentType = 'abasto';
            let unit: UnitType = 'eur_kg_vivo';
            
            if (producto.includes('VIDA')) {
                segment = 'vida';
                unit = 'eur_unidad'; // In Spain, vida is usually per unit or kg vivo. Let's assume eur_unidad but normalize if needed
                // If the string says kg, override
                if (categoria.toLowerCase().includes('kg')) unit = 'eur_kg_vivo';
            } else if (producto.includes('CARNE')) {
                segment = 'carne';
                unit = 'eur_kg_canal';
            }
            
            prices.push({
                date: fecha,
                species: 'bovino',
                segment,
                category_name: categoria,
                normalized_category: SalamancaParser.normalizeCategory(categoria),
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
