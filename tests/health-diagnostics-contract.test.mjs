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
  assert.match(route,/describeStorageEndpoint/);
  assert.doesNotMatch(route,/\.reason\.message/);
  assert.doesNotMatch(route,/message:/);
});

test('contrato antigo de checks permanece compatível',()=>{
  assert.match(route,/database:results\[0\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/storage:results\[1\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/auth:results\[2\]\.status==='fulfilled'\?'ok':'unavailable'/);
  assert.match(route,/\{status:ready\?'ready':'unavailable',checks,diagnostics,storageEndpoint:describeStorageEndpoint/);
});


test('endpoint storage expõe apenas provider e validade estrutural',()=>{
  assert.match(diag,/provider:'cloudflare-r2'/);
  assert.match(diag,/provider:'aws-s3'/);
  assert.match(diag,/provider:'custom'/);
  assert.match(diag,/provider:'invalid'/);
  assert.match(diag,/format:r2\.test\(host\)\?'valid':'invalid'/);
  assert.doesNotMatch(route,/S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY/);
});


test('endpoint R2 incompleto é normalizado antes do cliente S3',()=>{
  const s3=readFileSync(new URL('../app/storage/s3.ts',import.meta.url),'utf8');
  assert.match(diag,/export function normalizeStorageEndpoint/);
  assert.match(diag,/\.r2\\.cloudflarestorage\$\/i/);
  assert.match(diag,/return trimmed\+'\.com'/);
  assert.match(s3,/normalizeStorageEndpoint\(process\.env\.S3_ENDPOINT\)/);
});
