import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch (e) {
            // Ignorar si el body viene vacío
        }
        
        const sourceId = (body as any).sourceId;

        // Importación dinámica para aislar posibles crashes del empaquetador (Webpack) o Vercel Serverless
        // causados por dependencias pesadas (pdf-parse, crypto) al nivel global del archivo.
        const { MarketETLService } = await import('@/lib/services/etl/MarketETLService');

        await MarketETLService.run(sourceId);
        
        // Devolvemos 200 siempre. Vercel intercepta 500s en endpoints API a veces y tira HTML, 
        // lo que rompe el JSON.parse del cliente. 
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('ETL API Route Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error desconocido procesando la lonja' });
    }
}
