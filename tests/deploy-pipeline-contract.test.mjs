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


test('deploy confirma que a revisão publicada realmente mudou',()=>{
  const workflow=read('.github/workflows/deploy-production.yml');
  const smoke=read('scripts/smoke-deployment.mjs');
  const marker=read('scripts/write-build-info.mjs');
  const docker=read('Dockerfile');

  const capture=workflow.indexOf('Capture current production build');
  const trigger=workflow.indexOf('Trigger EasyPanel deploy');
  const homologate=workflow.indexOf('Homologate published deployment');
  assert.ok(capture>0&&capture<trigger&&trigger<homologate,'ordem do deploy precisa ser captura → trigger → homologação');

  assert.match(workflow,/HOMOLOGATION_PREVIOUS_BUILD_ID:/);
  assert.match(workflow,/steps\.current-build\.outputs\.build_id/);
  assert.match(smoke,/\/build-info\.json/);
  assert.match(smoke,/HOMOLOGATION_PREVIOUS_BUILD_ID/);
  assert.match(smoke,/lastBuild!==previousBuildId/);
  assert.match(marker,/public\/build-info\.json/);
  assert.match(marker,/buildId/);
  assert.match(marker,/builtAt/);
  assert.match(docker,/node scripts\/write-build-info\.mjs/);
});
