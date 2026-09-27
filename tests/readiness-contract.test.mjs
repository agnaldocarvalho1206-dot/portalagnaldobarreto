import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ready=readFileSync(new URL('../app/api/health/ready/route.ts',import.meta.url),'utf8');
const smoke=readFileSync(new URL('../scripts/smoke-deployment.mjs',import.meta.url),'utf8');

test('readiness reporta componentes sem expor mensagens internas',()=>{
  assert.match(ready,/database:results\[0\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(ready,/storage:results\[1\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(ready,/auth:results\[2\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(ready,/status:ready\?'ready':'unavailable'/);
  assert.doesNotMatch(ready,/reason\s*:/);
  assert.doesNotMatch(ready,/message\s*:/);
  assert.doesNotMatch(ready,/String\(results/);
});

test('smoke inclui corpo seguro quando endpoint falha',()=>{
  assert.match(smoke,/response\.clone\(\)\.text\(\)/);
  assert.match(smoke,/slice\(0,1000\)/);
});


test('smoke separa revisão publicada da saúde das dependências',()=>{
  const live=readFileSync(new URL('../app/api/health/live/route.ts',import.meta.url),'utf8');
  assert.match(live,/contract: 'portal-ab-health-v2'/);
  assert.match(smoke,/EXPECTED_LIVE_CONTRACT='portal-ab-health-v2'/);
  assert.match(smoke,/async function waitForCurrentDeployment/);
  assert.match(smoke,/new URL\('\/api\/health\/live',base\)/);
  assert.match(smoke,/attempt<=20/);
  assert.match(smoke,/setTimeout\(resolve,15000\)/);
  assert.match(smoke,/Produção não atualizou para o contrato de liveness/);
  assert.match(smoke,/request\('\/api\/health\/ready',\{expected:\[200\]\}\)/);
});
