import { validateProductionConfig } from '../lib/production-config.mjs';

validateProductionConfig();

function firstDefined(...values) {
  return values.find((value) => typeof value === 'string' && value.length > 0);
}

function normalizeDatabaseUrl(value) {
  if (!value) return value;
  const url = new URL(value);

  if (url.hostname === 'portalagnaldobarreto') {
    url.hostname = 'portal-agnaldobarreto_database_01';
  }

  const user = firstDefined(
    url.username,
    process.env.DATABASE_USER,
    process.env.DB_USER,
    process.env.PGUSER,
  );

  const password = firstDefined(
    url.password,
    process.env.DATABASE_PASSWORD,
    process.env.DB_PASSWORD,
    process.env.PGPASSWORD,
  );

  if (user && !url.username) {
    url.username = user;
  }

  if (password && !url.password) {
    url.password = password;
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
