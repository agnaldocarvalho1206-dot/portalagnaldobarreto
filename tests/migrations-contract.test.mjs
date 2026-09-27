import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

test('todas as migrações PostgreSQL aplicam do zero na ordem oficial', async () => {
  await mkdir('work',{recursive:true});
  const dir=await mkdtemp(path.resolve('work','migrations-'));
  const db=await PGlite.create(dir);
  const migrationDir=path.resolve('drizzle/postgres');
  const files=(await readdir(migrationDir)).filter(x=>x.endsWith('.sql')).sort();

  assert.ok(files.includes('0016_client_project_relationship.sql'));

  for(const file of files){
    const sql=await readFile(path.join(migrationDir,file),'utf8');
    await db.exec(sql);
  }

  const projectColumns=await db.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='client_projects'
  `);
  const names=new Set(projectColumns.rows.map(row=>row.column_name));
  for(const column of ['id','lead_id','user_id','client_id','name','phase','progress','updated']){
    assert.ok(names.has(column),'client_projects sem coluna '+column);
  }

  for(const table of ['leads','crm_clients','proposals','project_tasks','calendar_events','approvals','financial_entries','portal_documents','portal_contents','support_tickets','portal_settings']){
    const found=await db.query('SELECT to_regclass($1) AS name',['public.'+table]);
    assert.equal(found.rows[0].name,table,'Tabela ausente: '+table);
  }

  await db.close();
});
