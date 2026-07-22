import { ETLParserResult, TrendType, UnitType, MarketSource, SegmentType } from '@/types/livestock';

export class SalamancaParser {
    
    // Define the bovino categories to parse from Salamanca
    // In Salamanca, "BOVINO DE CARNE" and "BOVINO DE VIDA" are the products
    
    static async parse(source: MarketSource): Promise<ETLParserResult> {
        // Fetch the metadata to dynamically find the latest CSV resource URL
        const metaUrl = "https://datosabiertossalamanca.es/api/3/action/package_show?id=cotizaciones-semanales-de-la-lonja-de-salamanca";
        const metaResponse = await fetch(metaUrl, { cache: 'no-store' });
        if (!metaResponse.ok) {
            throw new Error(`Salamanca API returned ${metaResponse.status} for package_show`);
        }
        
        const metaJson = await metaResponse.json();
        const csvRes = metaJson.result?.resources?.find((r: any) => r.format === 'CSV');
        
        if (!csvRes || !csvRes.url) {
            throw new Error('CSV resource not found in Salamanca metadata');
        }

        // Fetch the raw CSV text
        const csvResponse = await fetch(csvRes.url, { cache: 'no-store' });
        if (!csvResponse.ok) {
            throw new Error(`Salamanca API returned ${csvResponse.status} for CSV download`);
        }

        const arrayBuffer = await csvResponse.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const csvText = decoder.decode(arrayBuffer);
        const lines = csvText.split('\n');
        
        const prices = [];
        
        // Parse the first 3000 rows (plenty for the last few months of all mesas)
        for (let i = 1; i < lines.length; i++) {
            if (i > 3000) break; 
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(';');
            const clean = parts.map(p => p.replace(/^"|"$/g, ''));
            
            // Expected headers: "ID";"FECHA";"MESA";"PRODUCTO";"CATEGORIA";"VALOR1";"VALOR2"
            const fechaStr = clean[1];
            const mesa = clean[2];
            const producto = clean[3];
            const categoria = clean[4];
            const valor1Str = clean[5];
            
            if (!fechaStr || !mesa || !producto || !categoria || !valor1Str) {
                continue;
            }
            
            // Only process BOVINO
            if (!mesa.toUpperCase().includes('BOVINO')) continue;
            
            const fecha = new Date(fechaStr);
            
            const productoStr = producto.trim();
            const categoriaStr = categoria.trim();
            
            const fullCategoryName = `${productoStr} - ${categoriaStr}`;
            
            // The CSV JSON might return '6,77' as a string, or 6.77 as a number.
            const valor1 = typeof valor1Str === 'number' 
                ? valor1Str 
                : parseFloat(String(valor1Str).replace(',', '.'));
            
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
            rawContent: csvText,
            contentType: 'text/csv'
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
