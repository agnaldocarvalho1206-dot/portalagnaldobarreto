import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('H122: dashboard premium preserva o personagem existente e responsividade dos KPIs',()=>{
 const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(ui,/src="\/agnaldo\.png"/);
 assert.match(ui,/admin-dashboard-kpi-row-v66/);
 assert.match(css,/H122\.1 — AB Premium/);
 assert.match(css,/H122\.2 — Dashboard premium/);
 assert.match(css,/\.portal-admin-v65\.portal-tab-resumo \.admin-dashboard-kpi-row-v66 \.admin-kpis-v65\{\s*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:430px\)/);
});

test('H122.6–H122.9: melhorias de apresentação permanecem limitadas ao portal administrativo',()=>{
 const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 for(const section of ['clientes','projetos','leads-crm','propostas','tarefas','financeiro']){
   assert.match(css,new RegExp('\\.portal-tab-'+section+'\\b'), 'módulo sem escopo visual: '+section);
 }
 for(const stage of ['H122.6','H122.7','H122.8','H122.9']){
   assert.ok(css.includes(stage), 'ausente: '+stage);
 }
 assert.match(ui,/className=\{\x60portal-layout container \$\{admin\?'portal-admin-v65':''\} portal-tab-/);
 assert.match(ui,/src="\/agnaldo\.png"/);
 assert.match(ui,/action:\s*'create-finance'/);
 assert.match(ui,/action:\s*'create-project'/);
 assert.match(ui,/action:\s*'proposal-status'/);
 assert.match(ui,/action:\s*'lead-status'/);
});
