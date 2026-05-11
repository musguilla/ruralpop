import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MarketETLService } from '../src/lib/services/etl/MarketETLService';

async function run() {
    console.log("Running Full ETL Service...");
    await MarketETLService.run();
    console.log("Finished Full ETL Service");
}
run();
