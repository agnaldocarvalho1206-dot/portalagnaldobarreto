import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migrator=readFileSync(new URL('../lib/ensure-postgres-migrations.mjs',import.meta.url),'utf8');
const start=readFileSync(new URL('../scripts/start-container.mjs',import.meta.url),'utf8');
const manual=readFileSync(new URL('../scripts/migrate-postgres.mjs',import.meta.url),'utf8');

test('auto-migracao usa lock, transacao e checksum',()=>{
  assert.match(migrator,/BEGIN/);
  assert.match(migrator,/pg_advisory_xact_lock/);
  assert.match(migrator,/sha256/);
  assert.match(migrator,/ROLLBACK/);
  assert.match(migrator,/app_migrations/);
  assert.match(migrator,/MIGRATION_DATABASE_URL\|\|env\.DATABASE_URL/);
});

test('startup aplica migracoes pendentes sem impedir liveness em falha',()=>{
  assert.match(start,/ensurePostgresMigrations/);
  assert.match(start,/if\(migration\.status==='error'\)runtimeMode='degraded'/);
  assert.match(start,/await import\('\.\.\/server\.js'\)/);
  assert.doesNotMatch(start,/process\.exit/);
});

test('comando manual reutiliza exatamente o mesmo migrador',()=>{
  assert.match(manual,/ensurePostgresMigrations/);
  assert.match(manual,/if\(result\.status==='error'\)process\.exitCode=1/);
});
