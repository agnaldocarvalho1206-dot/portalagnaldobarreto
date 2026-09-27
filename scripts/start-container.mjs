import { validateRuntimeConfig } from '../lib/production-config.mjs';

let runtimeMode='ready';
try {
  validateRuntimeConfig();
} catch (error) {
  runtimeMode='degraded';
  console.error(JSON.stringify({
    event:'runtime_config_invalid',
    mode:'degraded',
    message:error instanceof Error?error.message:'Configuração inválida',
  }));
}

function firstDefined(...values) {
  return values.find((value) => typeof value === 'string' && value.length > 0);
}

function normalizeDatabaseUrl(value) {
  if (!value) return value;
  const url = new URL(value);

  if (url.hostname === 'portalagnaldobarreto') {
    url.hostname = 'portal-agnaldobarreto_database_01';
  }

  const currentDatabase = url.pathname.replace(/^\/+/, '');
  if (!currentDatabase || currentDatabase === 'portalagnaldobarreto') {
    url.pathname = '/portal_agnaldobarreto';
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

  if (user && !url.username) url.username = user;
  if (password && !url.password) url.password = password;

  return url.toString();
}

function prepareDatabaseUrl(name) {
  const value=process.env[name];
  if (!value) return null;
  try {
    const normalized=normalizeDatabaseUrl(value);
    if (normalized) process.env[name]=normalized;
    return normalized;
  } catch {
    runtimeMode='degraded';
    console.error(JSON.stringify({event:'runtime_database_config_invalid',variable:name,mode:'degraded'}));
    return null;
  }
}

const normalizedDatabaseUrl=prepareDatabaseUrl('DATABASE_URL');
prepareDatabaseUrl('MIGRATION_DATABASE_URL');

if (normalizedDatabaseUrl) {
  const databaseUrl = new URL(normalizedDatabaseUrl);
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
} else {
  runtimeMode='degraded';
  console.error(JSON.stringify({event:'runtime_database_unavailable',mode:'degraded'}));
}

console.log(JSON.stringify({ event: 'runtime_start', migrations: 'manual', mode: runtimeMode }));
await import('../server.js');
