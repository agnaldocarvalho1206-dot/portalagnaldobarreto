import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const diag=readFileSync(new URL('../lib/health-diagnostics.ts',import.meta.url),'utf8');
const route=readFileSync(new URL('../app/api/health/ready/route.ts',import.meta.url),'utf8');

test('readiness expõe apenas categorias seguras',()=>{
  for(const category of [
    'config','migration-pending','credentials','database-missing','schema',
    'connection','dns','timeout','tls','bucket','unknown'
  ]) assert.ok(diag.includes("'"+category+"'"),'categoria ausente: '+category);

  assert.match(route,/diagnostics=\{/);
  assert.match(route,/classifyDatabaseFailure/);
  assert.match(route,/classifyStorageFailure/);
  assert.doesNotMatch(route,/\.reason\.message/);
  assert.doesNotMatch(route,/message:/);
});

test('contrato antigo de checks permanece compatível',()=>{
  assert.match(route,/database:results\[0\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/storage:results\[1\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/auth:results\[2\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/\{status:ready\?'ready':'unavailable',checks,diagnostics\}/);
});
