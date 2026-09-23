import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { validateAttachment } from '../app/contact-upload.ts';

const source = readFileSync(new URL('../app/request-security.ts', import.meta.url), 'utf8')
  .replace("'./contact-upload'", JSON.stringify(new URL('../app/contact-upload.ts', import.meta.url).href));
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { readJsonObject, trustedOrigin, failure } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const request = (body, headers = {}) => new Request('https://portal.test/api/test', { method: 'POST', body, headers: { 'Content-Type': 'application/json', Host: 'portal.test', ...headers } });
assert.equal(trustedOrigin(request('{}')), false);
assert.equal(trustedOrigin(request('{}', { Origin: 'https://portal.test' })), true);
assert.equal(trustedOrigin(request('{}', { Origin: 'https://attacker.test' })), false);
assert.equal(trustedOrigin(request('{}', { Origin: 'https://portal.test', 'Sec-Fetch-Site': 'cross-site' })), false);
assert.deepEqual(await readJsonObject(request('{"name":"Teste"}')), { name: 'Teste' });
for (const input of ['{', 'null', '[]']) await assert.rejects(readJsonObject(request(input)), e => e.status === 400);
await assert.rejects(readJsonObject(request('{}', { 'Content-Type': 'text/plain' })), e => e.status === 415);
await assert.rejects(readJsonObject(request('x'.repeat(33)), 32), /BODY_TOO_LARGE/);
assert.equal(failure(new Error('BODY_TOO_LARGE'), 'test').status, 413);
assert.ok(validateAttachment('a.png', 'image/png', new Uint8Array([137,80,78,71,13,10,26,10])));
assert.ok(validateAttachment('a.pdf', 'application/pdf', new TextEncoder().encode('%PDF-')));
const png = readFileSync(new URL('../public/ab-transparent.png', import.meta.url));
assert.equal(validateAttachment('logo.png', 'image/png', png), null);
const corrupt = Buffer.from(png); corrupt[29] ^= 1;
assert.ok(validateAttachment('logo.png', 'image/png', corrupt));
assert.ok(validateAttachment('logo.html', 'text/html', png));

console.log('PASS: origem, JSON limitado, anexos, assinatura de arquivo e CRC.');
