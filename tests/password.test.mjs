import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/password.mjs';

test('senhas usam salt individual e verificam apenas a senha correta', async () => {
  const password = 'Teste-local-sem-uso-em-producao!';
  const a = await hashPassword(password);
  const b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.equal(a.includes(password), false);
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword('errada', a), false);
  assert.equal(await verifyPassword(password, 'hash-invalido'), false);
});
test('rejeita senhas pequenas e entradas excessivas', async () => {
  await assert.rejects(hashPassword('curta'));
  await assert.rejects(hashPassword('a'.repeat(1025)));
});
