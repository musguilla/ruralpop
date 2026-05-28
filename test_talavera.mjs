import { TalaveraParser } from './src/lib/services/etl/parsers/TalaveraParser.js';

// No puedo importar un .ts directamente en mjs sin ts-node o tsx.
// Como no estoy seguro de qué runner está configurado en package.json, haré un `run_command` con `npm run test` si lo hubiera, o usaré tsc / tsx.
