import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('../scripts/start-easypanel-service.mjs',import.meta.url),'utf8');
const workflow=readFileSync(new URL('../.github/workflows/deploy-production.yml',import.meta.url),'utf8');

test('start do EasyPanel usa endpoint oficial e exige HTTPS',()=>{
  assert.match(script,/\/api\/startAppService/);
  assert.match(script,/base\.protocol!=='https:'/);
  assert.match(script,/Authorization.*Bearer/);
  assert.match(script,/projectName,serviceName/);
  assert.doesNotMatch(script,/console\.log\([^\n]*token/);
});

test('deploy de producao tenta iniciar o servico antes e depois do trigger',()=>{
  assert.match(workflow,/Start EasyPanel service when API access is configured/);
  assert.match(workflow,/Ensure EasyPanel service is enabled after deploy trigger/);
  const calls=[...workflow.matchAll(/node scripts\/start-easypanel-service\.mjs/g)];
  assert.equal(calls.length,2);
  assert.match(workflow,/EASYPANEL_API_URL:/);
  assert.match(workflow,/EASYPANEL_API_TOKEN:/);
});
