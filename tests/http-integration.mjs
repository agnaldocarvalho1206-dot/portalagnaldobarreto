import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { hashPassword } from '../lib/password.mjs';
const base=process.env.TEST_APP_URL||'http://127.0.0.1:5317';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Testes somente em loopback.');
const db=new Pool({connectionString:process.env.DATABASE_URL,max:1});
const password=randomBytes(24).toString('hex'), prefix=randomUUID();
const users=[['admin','Administrador de teste'],['client','Cliente de teste'],['other','Outro cliente']];
const identities=[];
const leadIds=[];
const request=(path,method='GET',body,cookie='',extra={})=>fetch(base+path,{method,redirect:'manual',headers:{...(body?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{Origin:base}:{}),...(cookie?{Cookie:cookie}:{}),...extra},body:body?JSON.stringify(body):undefined});
try {
  for(const [role,name] of users) {
    const id=randomUUID(),email=prefix+'-'+role+'@example.test';
    await db.query('INSERT INTO users(id,email,name,password_hash,role,created) VALUES($1,$2,$3,$4,$5,$6)',[id,email,name,await hashPassword(password),role==='admin'?'admin':'client',Date.now()]);
    identities.push({id,email});
  }
  for(const path of ['/gestao','/portal']) {
    const r=await request(path);assert.equal(r.status,307,path);assert.match(r.headers.get('location'),/entrar/);
  }
  assert.equal((await request('/api/portal')).status,401);
  assert.equal((await request('/api/portal','GET',undefined,'',{'oai-authenticated-user-id':identities[0].id,'oai-authenticated-user-email':identities[0].email})).status,401);
  assert.equal((await request('/api/settings','PUT',{})).status,403);
  assert.equal((await request('/api/auth/login','POST',{email:identities[0].email,password},{},{Origin:'https://attacker.test'})).status,403);
  assert.equal((await request('/api/auth/login','POST',{email:identities[0].email,password:'senha-errada'})).status,401);
  for(const u of identities) {
    const r=await request('/api/auth/login','POST',{email:u.email,password});assert.equal(r.status,200);
    const header=r.headers.get('set-cookie');assert.match(header,/HttpOnly/i);assert.match(header,/SameSite=lax/i);
    if(process.env.TEST_PRODUCTION==='true')assert.match(header,/Secure/i);
    u.cookie=header.match(/portal_session=[a-f0-9]{64}/)[0];
  }
  const [admin,client,other]=identities;
  const clientPanel=await request('/gestao','GET',undefined,client.cookie);assert.doesNotMatch(await clientPanel.text(),/CENTRAL DE GESTÃO/);
  assert.equal((await request('/api/settings','PUT',{},client.cookie)).status,403);
  assert.equal((await request('/api/portal','POST',{action:'create-project'},client.cookie)).status,403);
  const id=randomUUID();leadIds.push(id);
  const lead={id,name:'Contato de integração',email:client.email,phone:'11999999999',service:'Sites institucionais',message:'Solicitação utilizada exclusivamente no teste de integração.',consent:true};
  // Obtain an actual service name from the existing source.
  const source=await readFile(new URL('../app/content.ts',import.meta.url),'utf8');
  lead.service=source.match(/name:'([^']+)'/)[1];
  const form=new FormData();form.set('data',JSON.stringify(lead));
  const image=await readFile(new URL('../public/ab-transparent.png',import.meta.url));
  form.set('attachment',new Blob([image],{type:'image/png'}),'teste.png');
  const sent=await fetch(base+'/api/contact',{method:'POST',headers:{Origin:base,Cookie:client.cookie},body:form});
  assert.equal(sent.status,201,await sent.text());
  assert.equal((await request('/api/contact','POST',lead,client.cookie)).status,409);
  const saved=(await db.query('SELECT * FROM leads WHERE id=$1',[id])).rows[0];assert.equal(saved.user_id,client.id);
  const attachment=saved.message.match(/Anexo privado: (.*)$/)[1];
  assert.equal((await request(attachment)).status,401);
  assert.equal((await request(attachment,'GET',undefined,other.cookie)).status,404);
  const downloaded=await request(attachment,'GET',undefined,client.cookie);assert.equal(downloaded.status,200);
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),image);
  assert.match(downloaded.headers.get('content-disposition'),/attachment/);
  const created=await request('/api/portal','POST',{action:'create-project',leadId:id,name:'Projeto de integração'},admin.cookie);
  assert.equal(created.status,200);const project=(await created.json()).id;
  assert.equal((await request('/api/portal','POST',{action:'update-project',id:project,phase:'Design',progress:45},admin.cookie)).status,200);
  assert.equal((await request('/api/portal','POST',{action:'update-project',id:project,phase:'Design',progress:101},admin.cookie)).status,400);
  assert.equal((await request('/api/portal','POST',{action:'message',projectId:project,body:'Mensagem persistida'},client.cookie)).status,200);
  assert.equal((await request('/api/portal','POST',{action:'message',projectId:project,body:'Indevida'},other.cookie)).status,404);
  const own=await (await request('/api/portal','GET',undefined,client.cookie)).json();
  assert.equal(own.projects[0].progress,45);assert.equal(own.messages[0].body,'Mensagem persistida');
  const foreign=await (await request('/api/portal','GET',undefined,other.cookie)).json();
  assert.equal(foreign.leads.length,0);assert.equal(foreign.projects.length,0);assert.equal(foreign.messages.length,0);
  await db.query('UPDATE sessions SET expires=0 WHERE user_id=$1',[other.id]);
  assert.equal((await request('/api/portal','GET',undefined,other.cookie)).status,401);
  assert.equal((await request('/api/auth/logout','POST',undefined,client.cookie)).status,200);
  assert.equal((await request('/api/portal','GET',undefined,client.cookie)).status,401);
  assert.equal((await request('/api/health/ready')).status,200);
  for(const path of ['/','/sobre','/projetos','/servicos','/blog','/contato','/entrar','/privacidade','/depoimentos'])assert.equal((await request(path)).status,200,path);
  console.log('PASS: páginas, login, senha incorreta, cabeçalhos forjados, CSRF, isolamento, gravação, anexos, expiração, logout e readiness.');
} finally {
  for(const id of leadIds) {
    await db.query('DELETE FROM messages WHERE project_id IN (SELECT id FROM client_projects WHERE lead_id=$1)',[id]);
    await db.query('DELETE FROM client_projects WHERE lead_id=$1',[id]);
    await db.query('DELETE FROM leads WHERE id=$1',[id]);
  }
  for(const u of identities)await db.query('DELETE FROM users WHERE id=$1',[u.id]);
  await db.end();
}
