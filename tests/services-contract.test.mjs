import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const page=readFileSync(new URL('../app/services-ab.tsx',import.meta.url),'utf8');
const data=readFileSync(new URL('../app/services-data.ts',import.meta.url),'utf8');

test('cada serviço do catálogo possui ícone estável por slug',()=>{
  const orderMatch=data.match(/const order=\[([^\]]+)\]/);
  assert.ok(orderMatch,'ordem de serviços não encontrada');
  const slugs=[...orderMatch[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
  assert.equal(slugs.length,9);

  for(const slug of slugs){
    assert.match(page,new RegExp('(?:^|[,\\{])'+slug+':'));
  }

  assert.doesNotMatch(page,/const icons=/);
  assert.doesNotMatch(page,/const Icon=icons\[i\]/);
  assert.match(page,/const Icon=serviceIcons\[s\.slug\]/);
  assert.match(page,/treinamentos:GraduationCap/);
});
