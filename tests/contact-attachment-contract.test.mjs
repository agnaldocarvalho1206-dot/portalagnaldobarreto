import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('anexo de contato permanece privado mas acessível ao operador do CRM',()=>{
  const route=read('app/api/contact-attachment/route.ts');
  assert.match(route,/const \{user,operator\}=await identity\(\)/);
  assert.match(route,/!operator&&row\.user_id!==user\.userId/);
  assert.match(route,/object\.customMetadata\?\.leadId!==lead/);
  assert.match(route,/Content-Disposition/);
  assert.match(route,/Cache-Control':'private, no-store/);
});

test('CRM exibe somente o endpoint privado do anexo salvo',()=>{
  const ui=read('app/portal-ui.tsx');
  assert.match(ui,/const leadAttachment=/);
  assert.match(ui,/contact-attachment/);
  assert.match(ui,/>Baixar anexo privado<\/a>/);
  assert.match(ui,/leadAttachment\(l\.message\)/);
  assert.doesNotMatch(ui,/Anexo privado: https?:\/\//);
});


test('cliente não vinculado ao CRM mantém área funcional de transição',()=>{
  const ui=read('app/portal-ui.tsx');
  assert.match(ui,/tab==='Resumo'&&!admin/);
  assert.match(ui,/tab==='Solicitações'&&!admin/);
  assert.match(ui,/tab==='Projetos'&&!admin/);
  assert.match(ui,/Baixar meu anexo privado/);
  assert.match(ui,/Acompanhe suas solicitações enquanto preparamos o vínculo completo/);
  assert.match(ui,/setSelected\(p\.id\);setTab\('Mensagens'\)/);
});
