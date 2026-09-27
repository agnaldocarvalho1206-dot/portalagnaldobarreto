import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('migração H03 recupera client_id e updated em projetos existentes', async () => {
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
