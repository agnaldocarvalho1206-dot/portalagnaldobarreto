import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

if (!process.env.MIGRATION_DATABASE_URL) throw new Error('MIGRATION_DATABASE_URL não configurada.');

const { Pool } = await import('pg');
const pool = new Pool({
  connectionString: process.env.MIGRATION_DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
});

let client;
try {
  client = await pool.connect();
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['portal-agnaldo-migrations']);
  await client.query(`CREATE TABLE IF NOT EXISTS app_migrations (
    id text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const directory = path.resolve('drizzle/postgres');
  const files = (await fs.readdir(directory)).filter(name => name.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(directory, file), 'utf8');
    const checksum = (await import('node:crypto')).createHash('sha256').update(sql).digest('hex');
    const prior = await client.query('SELECT checksum FROM app_migrations WHERE id=$1', [file]);

    if (prior.rowCount) {
      if (prior.rows[0].checksum !== checksum) throw new Error(`Checksum alterado: ${file}`);
      continue;
    }

    await client.query(sql);
    await client.query('INSERT INTO app_migrations (id, checksum) VALUES ($1,$2)', [file, checksum]);
    console.log(JSON.stringify({ event: 'database_migration_applied', file }));
  }

  await client.query('COMMIT');
  console.log(JSON.stringify({ event: 'database_migrations_verified', count: files.length }));
} catch (error) {
  if (client) await client.query('ROLLBACK');
  console.error(JSON.stringify({
    event: 'database_migration_error',
    code: error?.code || 'UNKNOWN',
    message: error?.message || 'Migração não concluída',
  }));
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
