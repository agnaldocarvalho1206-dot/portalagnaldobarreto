import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../app/auth/redirect.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const auth = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('return_to aceita somente rotas internas conhecidas', () => {
  assert.equal(auth.safePortalReturn('/portal'), '/portal');
  assert.equal(auth.safePortalReturn('/gestao'), '/gestao');
  for (const value of ['https://attacker.test', '//attacker.test', '/contato', '', null, undefined]) {
    assert.equal(auth.safePortalReturn(value), null);
  }
});

test('cliente nunca é redirecionado para gestão', () => {
  assert.equal(auth.loginRedirect('client', '/gestao'), '/portal');
  assert.equal(auth.loginRedirect('client', '/portal'), '/portal');
  assert.equal(auth.loginRedirect('client', 'https://attacker.test'), '/portal');
});

test('admin e staff podem retornar à gestão ou ao portal', () => {
  assert.equal(auth.loginRedirect('admin', '/gestao'), '/gestao');
  assert.equal(auth.loginRedirect('staff', '/gestao'), '/gestao');
  assert.equal(auth.loginRedirect('admin', '/portal'), '/portal');
  assert.equal(auth.loginRedirect('staff', '/portal'), '/portal');
  assert.equal(auth.loginRedirect('admin', 'https://attacker.test'), '/gestao');
});

test('signInPath sempre produz destino interno', () => {
  assert.equal(auth.signInPath('/gestao'), '/entrar?return_to=%2Fgestao');
  assert.equal(auth.signInPath('https://attacker.test'), '/entrar?return_to=%2Fportal');
});
