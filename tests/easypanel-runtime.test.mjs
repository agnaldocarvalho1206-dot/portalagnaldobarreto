import assert from 'node:assert/strict';

const live = await import('../app/api/health/live/route.ts');
const response = await live.GET();
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { status: 'ok' });
assert.equal(response.headers.get('cache-control'), 'no-store');
console.log('OK: liveness sem dependências e sem cache.');
