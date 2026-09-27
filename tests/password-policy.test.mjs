import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../app/password-policy.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{
  compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},
}).outputText;
const mod=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

test('politica de nova credencial exige comprimento e variedade',()=>{
  const validate=mod.newPasswordError;
  assert.equal(mod.PASSWORD_MIN_LENGTH,12);
  assert.ok(validate('Aa1!'));
  assert.ok(validate('ABCDEFGHIJK1!'));
  assert.ok(validate('abcdefghijk1!'));
  assert.ok(validate('Abcdefghijkl!'));
  assert.ok(validate('Abcdefghijkl1'));
  assert.equal(validate('Abcdefghij1!'),'');
});

test('formulario usa a politica compartilhada',()=>{
  const form=readFileSync(new URL('../app/reset-password-form.tsx',import.meta.url),'utf8');
  assert.match(form,/newPasswordError\(password\)/);
  assert.match(form,/minLength=\{PASSWORD_MIN_LENGTH\}/);
  assert.match(form,/password-rules/);
});
