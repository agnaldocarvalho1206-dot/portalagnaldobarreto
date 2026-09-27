import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('deploy de produção exige Trigger URL secreto e homologa depois do gatilho',()=>{
  const workflow=read('.github/workflows/deploy-production.yml');
  const trigger=read('scripts/trigger-easypanel-deploy.mjs');
  const manual=read('.github/workflows/homologate-deployment.yml');

  assert.match(workflow,/push:\s*\n\s*branches: \[main\]/);
  assert.match(workflow,/secrets\.EASYPANEL_DEPLOY_TRIGGER_URL/);
  assert.match(workflow,/Trigger EasyPanel deploy/);
  assert.match(workflow,/Homologate published deployment/);
  assert.match(workflow,/portal-agnaldobarretoapp/);
  assert.match(trigger,/process\.env\.EASYPANEL_DEPLOY_TRIGGER_URL/);
  assert.match(trigger,/url\.protocol!=='https:'/);
  assert.match(trigger,/method:'GET'/);
  assert.doesNotMatch(trigger,/console\.(?:log|error)\([^\n]*url/);
  assert.doesNotMatch(manual,/push:\s*\n\s*branches: \[main\]/);
  assert.match(manual,/workflow_dispatch:/);
});

test('Trigger URL nunca aparece literal nos arquivos de deploy',()=>{
  for(const file of [
    '.github/workflows/deploy-production.yml',
    '.github/workflows/homologate-deployment.yml',
    'scripts/trigger-easypanel-deploy.mjs',
    'DEPLOY-EASYPANEL.md',
  ]){
    const source=read(file);
    assert.doesNotMatch(source,/https:\/\/[^\s"'<>]+(?:deploy|trigger)[^\s"'<>]*token=/i,file+' contém possível URL secreta');
  }
});
