import assert from 'node:assert/strict';

const live = await import('../app/api/health/live/route.ts');
const response = await live.GET();
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { status: 'ok', contract: 'portal-ab-health-v2' });
assert.equal(response.headers.get('cache-control'), 'no-store');
console.log('OK: liveness sem dependências e sem cache.');

import { readFileSync } from 'node:fs';

const containerStart=readFileSync(new URL('../scripts/start-container.mjs',import.meta.url),'utf8');
assert.doesNotMatch(containerStart,/spawnSync/);
assert.match(containerStart,/ensurePostgresMigrations/);
assert.match(containerStart,/migrations:migrationStatus/);
assert.match(containerStart,/validateRuntimeConfig/);
assert.match(containerStart,/runtime_config_invalid/);
assert.match(containerStart,/mode:'degraded'/);
assert.match(containerStart,/runtime_database_unavailable/);
assert.doesNotMatch(containerStart,/throw error/);
assert.doesNotMatch(containerStart,/validateProductionConfig/);
assert.match(containerStart,/import\('\.\.\/server\.js'\)/);
console.log('OK: container aplica apenas migrações pendentes de forma segura e mantém startup degradado em falha.');
