import { validateProductionConfig } from '../lib/production-config.mjs';

validateProductionConfig();

function normalizeDatabaseHost(value) {
  if (!value) return value;
  const url = new URL(value);

  // Compatibility guard for the legacy EasyPanel host that is still being
  // injected into the running container. Remove this once the service
  // environment is confirmed to use the generated internal PostgreSQL host.
  if (url.hostname === 'portalagnaldobarreto') {
    url.hostname = 'portal-agnaldobarreto_database_01';
    return url.toString();
  }

  return value;
}

process.env.DATABASE_URL = normalizeDatabaseHost(process.env.DATABASE_URL);
if (process.env.MIGRATION_DATABASE_URL) {
  process.env.MIGRATION_DATABASE_URL = normalizeDatabaseHost(process.env.MIGRATION_DATABASE_URL);
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const databaseName = databaseUrl.pathname.startsWith('/')
  ? databaseUrl.pathname.slice(1)
  : databaseUrl.pathname;

console.log(JSON.stringify({
  event: 'runtime_database_target',
  hostname: databaseUrl.hostname,
  port: databaseUrl.port || '5432',
  database: databaseName,
  hasUsername: Boolean(databaseUrl.username),
  hasPassword: Boolean(databaseUrl.password),
}));

await import('../server.js');
