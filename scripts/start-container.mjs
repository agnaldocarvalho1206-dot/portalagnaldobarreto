import { validateProductionConfig } from '../lib/production-config.mjs';
validateProductionConfig();
await import('../server.js');
