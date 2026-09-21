import { validateProductionConfig } from '../lib/production-config.mjs';

validateProductionConfig();

function normalizeDatabaseUrl(value) {
  if (!value) return value;
  const url = new URL(value);

  if (url.hostname === 'portalagnaldobarreto') {
    url.hostname = 'portal-agnaldobarreto_database_01';
  }

  if (!url.username && process.env.DATABASE_USER) {
    url.username = process.env.DATABASE_USER;
  }

  if (!url.password && process.env.DATABASE_PASSWORD) {
    url.password = process.env.DATABASE_PASSWORD;
  }

  return url.toString();
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (process.env.MIGRATION_DATABASE_URL) {
  process.env.MIGRATION_DATABASE_URL = normalizeDatabaseUrl(process.env.MIGRATION_DATABASE_URL);
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
  credentialSource: (databaseUrl.username && databaseUrl.password) ? 'database_url_or_separate_env' : 'missing',
}));

await import('../server.js');
