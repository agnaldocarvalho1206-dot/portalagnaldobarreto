import { createInterface } from 'node:readline/promises';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { hashPassword } from '../lib/password.mjs';

// No password arguments or environment variables: they leak through history/process listings.
const mode=process.argv[2];
if(!['create-admin','create-client','reset-password'].includes(mode)) throw new Error('Ação inválida.');
if(!process.stdin.isTTY) throw new Error('Use um terminal interativo (docker exec -it).');
if(!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL.');
const rl=createInterface({input:process.stdin,output:process.stdout});
const email=(await rl.question('E-mail da conta: ')).trim().toLowerCase();
if(!/^\S+@\S+\.\S+$/.test(email)||email.length>200) {rl.close();throw new Error('E-mail inválido.');}
const name=mode==='reset-password'?'':(await rl.question('Nome: ')).trim();
rl.close();
if(mode!=='reset-password'&&(!name||name.length>120)) throw new Error('Nome inválido.');
function hidden(prompt) {
  return new Promise((resolve,reject)=>{
    let value='';process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();
    const cleanup=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};
    const onData=(chunk)=>{
      for(const ch of chunk.toString('utf8')) {
        if(ch==='\u0003'){cleanup();reject(new Error('Cancelado.'));return;}
        if(ch==='\r'||ch==='\n'){cleanup();resolve(value);return;}
        if(ch==='\u007f'||ch==='\b')value=value.slice(0,-1);
        else if(ch>=' ')value+=ch;
      }
    };
    process.stdin.on('data',onData);
  });
}
const password=await hidden('Senha (mínimo 12 caracteres, entrada oculta): ');
if(password!==await hidden('Confirme a senha: ')) throw new Error('As senhas não coincidem.');
const hash=await hashPassword(password);
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:false,max:1,connectionTimeoutMillis:5000});
let client;
try {
  client=await pool.connect();await client.query('BEGIN');
  if(mode==='reset-password') {
    const result=await client.query('UPDATE users SET password_hash=$1 WHERE email=$2 RETURNING id',[hash,email]);
    if(!result.rowCount) throw new Error('Conta não encontrada.');
    await client.query('DELETE FROM sessions WHERE user_id=$1',[result.rows[0].id]);
  } else {
    const id=randomUUID();
    await client.query('INSERT INTO users(id,email,name,password_hash,role,created) VALUES($1,$2,$3,$4,$5,$6)',[id,email,name,hash,mode==='create-admin'?'admin':'client',Date.now()]);
    // Operator-verified customer email links earlier anonymous requests to this account.
    await client.query('UPDATE leads SET user_id=$1 WHERE email=$2 AND user_id IS NULL',[id,email]);
    await client.query('UPDATE client_projects SET user_id=$1 WHERE user_id IS NULL AND lead_id IN (SELECT id FROM leads WHERE user_id=$1)',[id]);
  }
  await client.query('COMMIT');console.log('Conta atualizada. Acesse /entrar.');
} catch(e) {if(client)await client.query('ROLLBACK');console.error(e.code==='23505'?'E-mail já cadastrado. Use user:password.':'Operação não concluída. Confira o banco e os dados.');process.exitCode=1;}
finally {client?.release();await pool.end();}
