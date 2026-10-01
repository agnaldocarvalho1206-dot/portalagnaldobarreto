import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('migração H03 recupera client_id e updated em projetos existentes', async () => {
  await mkdir('work',{recursive:true});
  const dir = await mkdtemp(path.resolve('work', 'portal-flow-'));
  const db = await PGlite.create(dir);

  await db.exec(read('drizzle/postgres/0000_initial.sql'));
  await db.exec(read('drizzle/postgres/0002_crm_clients.sql'));

  const now = 1727300000000;
  await db.query(
    'INSERT INTO leads (id,user_id,name,email,phone,company,service,budget,deadline,message,status,created,ip_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
    ['lead-1','user-1','Cliente Teste','cliente@example.com','11999999999','Empresa','Portal','A definir','A combinar','Teste','Aprovado',now,'hash']
  );
  await db.query(
    'INSERT INTO crm_clients (id,lead_id,user_id,name,email,phone,company,status,notes,created,updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    ['client-1','lead-1','user-1','Cliente Teste','cliente@example.com','11999999999','Empresa','Ativo','',now,now]
  );
  await db.query(
    'INSERT INTO client_projects (id,lead_id,user_id,name,phase,progress,deadline,description,created) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    ['project-1','lead-1','user-1','Projeto Teste','Descoberta',0,'','Projeto legado',now]
  );

  await db.exec(read('drizzle/postgres/0016_client_project_relationship.sql'));

  const result = await db.query('SELECT client_id,updated FROM client_projects WHERE id=$1',['project-1']);
  assert.equal(result.rows[0].client_id,'client-1');
  assert.equal(Number(result.rows[0].updated),now);

  await db.close();
});

test('contrato H03 mantém o vínculo real em criação, conversão e mensagens', () => {
  const api = read('app/api/portal/route.ts');
  const ui = read('app/portal-ui.tsx');
  const db = read('db/postgres.ts');

  assert.match(api, /INSERT INTO client_projects \(id,lead_id,user_id,client_id,name,phase,progress,deadline,description,created,updated\)/);
  assert.match(api, /UPDATE client_projects SET client_id=\?,user_id=COALESCE\(user_id,\?\),updated=\?/);
  assert.match(api, /SELECT id,user_id,client_id FROM client_projects WHERE id = \?/);
  assert.match(api, /project\.client_id!==clientId/);
  assert.match(api, /link-client-user/);
  assert.match(api, /Este usuário já está vinculado a outro cliente/);
  assert.match(ui, /action:'link-client-user'/);
  assert.match(ui, /Portal vinculado/);
  assert.match(db, /0016_client_project_relationship\.sql/);
});

test('vínculo Cliente ↔ Usuário permanece exclusivo do administrador', () => {
  const api = read('app/api/portal/route.ts');
  const adminSet = api.match(/const adminOnlyActions=new Set\(\[([^\]]+)\]\)/)?.[1] ?? '';
  const staffSet = api.match(/const staffActions=new Set\(\[([^\]]+)\]\)/)?.[1] ?? '';

  assert.match(adminSet, /link-client-user/);
  assert.doesNotMatch(staffSet, /link-client-user/);
});


test('staff não recebe caminhos de interface para Configurações', () => {
  const ui = read('app/portal-ui.tsx');
  const settingsApi = read('app/api/settings/route.ts');

  assert.match(ui, /tab==='Configurações'&&isFullAdmin/);
  assert.match(ui, /fullAdmin=\{isFullAdmin\}/);
  assert.match(ui, /fullAdmin\?links:links\.filter/);
  assert.match(ui, /isFullAdmin&&<button onClick=\{\(\)=>setTab\('Configurações'\)\}/);
  assert.match(settingsApi, /const \{admin\}=await identity\(\);if\(!admin\)return error\('Acesso restrito\.',403\)/);
});


test('H49 impede cruzamento de cliente e projeto em Financeiro e Suporte', () => {
  const api = read('app/api/portal/route.ts');
  const guard = /O projeto selecionado não pertence ao cliente informado\./g;
  assert.equal((api.match(guard) || []).length, 2);
  assert.match(api, /if\(b\.action==='create-finance'\)[\s\S]*SELECT id,client_id FROM client_projects WHERE id=\?/);
  assert.match(api, /if\(b\.action==='create-ticket'\)[\s\S]*SELECT id,client_id FROM client_projects WHERE id=\?/);
  assert.match(api, /finances:\(await db\.prepare\("SELECT f\.\* FROM financial_entries f LEFT JOIN client_projects p ON p\.id=f\.project_id WHERE f\.client_id=\? AND f\.entry_type='Receita' AND \(f\.project_id IS NULL OR p\.client_id=\?\)/);
  assert.match(api, /tickets:\(await db\.prepare\('SELECT \* FROM support_tickets WHERE client_id=\?/);
});


test('H54 isola integralmente dados do Portal do Cliente pelo client_id autenticado', () => {
  const api = read('app/api/portal/route.ts');

  assert.match(api, /SELECT id FROM crm_clients WHERE user_id=\? LIMIT 1/);
  assert.match(api, /SELECT \* FROM client_projects WHERE client_id=\? ORDER BY updated DESC/);
  assert.match(api, /JOIN client_projects p ON p\.id=t\.project_id WHERE p\.client_id=\?/);
  assert.match(api, /JOIN client_projects p ON p\.id=a\.project_id WHERE p\.client_id=\?/);
  assert.match(api, /WHERE f\.client_id=\? AND f\.entry_type='Receita' AND \(f\.project_id IS NULL OR p\.client_id=\?\)/);
  assert.match(api, /SELECT \* FROM portal_documents WHERE client_id=\? AND status='Ativo'/);
  assert.match(api, /SELECT \* FROM support_tickets WHERE client_id=\?/);
  assert.match(api, /JOIN client_projects p ON p\.id=m\.project_id WHERE p\.client_id = \? OR p\.user_id = \?/);
  assert.match(api, /if\(!operator&&b\.action==='client-approval-status'\)[\s\S]*p\.client_id=\?/);
  assert.match(api, /if\(!operator&&b\.action==='client-create-ticket'\)[\s\S]*WHERE id=\? AND client_id=\?/);
  assert.match(api, /if\(b\.action==='message'\)[\s\S]*project\.client_id!==clientId/);
});
