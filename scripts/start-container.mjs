import { validateProductionConfig } from '../lib/production-config.mjs';
validateProductionConfig();
const databaseUrl=new URL(process.env.DATABASE_URL);
console.log(JSON.stringify({
  event:'runtime_database_target',
  hostname:databaseUrl.hostname,
  port:databaseUrl.port||'5432',
  database:databaseUrl.pathname.replace(/^\\/+/, ''),
}));
await import('../server.js');
