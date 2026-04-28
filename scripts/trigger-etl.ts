import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { MarketETLService } from '../src/lib/services/etl/MarketETLService';

async function run() {
    console.log('Iniciando ingesta manual de datos (ETL)...');
    try {
        await MarketETLService.run();
        console.log('Ingesta completada.');
        process.exit(0);
    } catch (e) {
        console.error('Error durante la ingesta:', e);
        process.exit(1);
    }
}

run();
