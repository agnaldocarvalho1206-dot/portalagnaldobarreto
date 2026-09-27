import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../app/public-settings-policy.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{
  compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},
}).outputText;
const {publicSettingsView}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

test('depoimentos sem aprovação explícita não ficam públicos',()=>{
  const result=publicSettingsView({
    testimonials:[
      {name:'Cliente A',quote:'Bom projeto.'},
      {name:'Cliente B',quote:'Projeto aprovado.',approved:true},
      {name:'Cliente C',quote:'Ainda em validação.',approved:false},
    ],
  });
  assert.deepEqual(result.testimonials,[
    {name:'Cliente B',company:'',project:'',quote:'Projeto aprovado.',approved:true},
  ]);
});

test('depoimentos públicos exigem nome e texto além da aprovação',()=>{
  const result=publicSettingsView({
    testimonials:[
      {name:'',quote:'Sem nome',approved:true},
      {name:'Cliente',quote:'',approved:true},
      {name:' Cliente válido ',company:' Empresa ',project:' Portal ',quote:' Ótimo trabalho. ',approved:true},
    ],
  });
  assert.deepEqual(result.testimonials,[
    {name:'Cliente válido',company:'Empresa',project:'Portal',quote:'Ótimo trabalho.',approved:true},
  ]);
});

test('métricas só ficam confirmadas quando os quatro valores existem',()=>{
  assert.equal(publicSettingsView({
    metricsConfirmed:true,
    projects:'20',
    clients:'10',
    satisfaction:'98%',
    experience:'',
  }).metricsConfirmed,false);

  assert.equal(publicSettingsView({
    metricsConfirmed:true,
    projects:'20',
    clients:'10',
    satisfaction:'98%',
    experience:'5 anos',
  }).metricsConfirmed,true);
});

test('API preserva rascunhos para admin, mas marca aprovação explicitamente',()=>{
  const api=readFileSync(new URL('../app/api/settings/route.ts',import.meta.url),'utf8');
  assert.match(api,/admin\?value:publicSettingsView\(value\)/);
  assert.match(api,/approved:t\.approved===true/);
  assert.match(api,/metricsConfirmed:b\.metricsConfirmed===true&&\[projects,clients,satisfaction,experience\]\.every\(Boolean\)/);
});
