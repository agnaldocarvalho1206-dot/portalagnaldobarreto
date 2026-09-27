import assert from 'node:assert/strict';

const live = await import('../app/api/health/live/route.ts');
const response = await live.GET();
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { status: 'ok', contract: 'portal-ab-health-v2' });
assert.equal(response.headers.get('cache-control'), 'no-store');
console.log('OK: liveness sem dependências e sem cache.');

import { readFileSync } from 'node:fs';

const containerStart=readFileSync(new URL('../scripts/start-container.mjs',import.meta.url),'utf8');
assert.doesNotMatch(containerStart,/migrate-postgres\.mjs/);
assert.doesNotMatch(containerStart,/spawnSync/);
assert.match(containerStart,/migrations: 'manual'/);
assert.match(containerStart,/validateRuntimeConfig/);
assert.match(containerStart,/runtime_config_invalid/);
assert.doesNotMatch(containerStart,/validateProductionConfig/);
assert.match(containerStart,/import\('\.\.\/server\.js'\)/);
console.log('OK: container não executa migrações automaticamente.');
