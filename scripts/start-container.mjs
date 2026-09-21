import { validateProductionConfig } from '../lib/production-config.mjs';
validateProductionConfig();

const databaseUrl = new URL(process.env.DATABASE_URL);
const databaseName = databaseUrl.pathname.startsWith('/')
  ? databaseUrl.pathname.slice(1)
  : databaseUrl.pathname;

console.log(JSON.stringify({
  event: 'runtime_database_target',
  hostname: databaseUrl.hostname,
  port: databaseUrl.port || '5432',
  database: databaseName,
}));

await import('../server.js');
