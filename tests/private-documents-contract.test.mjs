import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('documentos usam bucket privado e endpoint autenticado',()=>{
  const route=read('app/api/portal-document/route.ts');
  const storage=read('app/storage/s3.ts');

  assert.match(route,/if\(!operator\)return error\('Acesso operacional necessário\.',403\)/);
  assert.match(route,/sameOrigin\(req\)/);
  assert.match(route,/validateAttachment/);
  assert.match(route,/documents\/\+'?\/?/);
  assert.match(route,/privateBucket\.put/);
  assert.match(route,/INSERT INTO portal_documents/);
  assert.match(route,/SELECT id FROM crm_clients WHERE user_id=\?/);
  assert.match(route,/document\.client_id!==client\.id/);
  assert.match(route,/object\.customMetadata\?\.documentId!==id/);
  assert.match(route,/Content-Disposition/);
  assert.match(route,/Cache-Control':'private, no-store/);

  assert.match(storage,/\(\?:contact\|documents\)/);
  assert.match(storage,/documentId:object\.Metadata\?\.documentid/);
  assert.match(storage,/clientId:object\.Metadata\?\.clientid/);
});

test('interface não cadastra nem abre documento por URL externa',()=>{
  const ui=read('app/portal-ui.tsx');
  const api=read('app/api/portal/route.ts');

  assert.match(ui,/fetch\('\/api\/portal-document'/);
  assert.match(ui,/name="file" type="file"/);
  assert.match(ui,/startsWith\('\/api\/portal-document\?'\)/);
  assert.match(ui,/Documento legado: reenvio privado necessário/);
  assert.match(ui,/REENVIAR PRIVADO/);
  assert.doesNotMatch(ui,/name="fileUrl"/);
  assert.match(api,/Use o upload privado de documentos\./);
  assert.doesNotMatch(api,/staffActions=new Set\(\[[^\]]*'create-document'/);
});
