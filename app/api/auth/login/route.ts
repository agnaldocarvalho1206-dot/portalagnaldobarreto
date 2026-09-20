import { randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from '../../../../lib/password.mjs';
import { getProductionDb } from '../../../../db/postgres';
import { createSession, revokeSession } from '../../../auth/session';
import { readJsonObject, trustedOrigin, failure, InputError } from '../../../request-security';
import { rateLimit, requestSubject } from '../../../rate-limit';
let dummyHash: Promise<string> | undefined;
let activeVerifications=0;
export async function POST(req: Request) {
  if (!trustedOrigin(req)) return Response.json({error:'Origem não permitida.'},{status:403});
  if(activeVerifications>=2)return Response.json({error:'Aguarde alguns instantes e tente novamente.'},{status:429,headers:{'Retry-After':'5'}});
  activeVerifications++;
  try {
    const b=await readJsonObject(req,4096);
    if(typeof b.email!=='string'||b.email.length>200||typeof b.password!=='string'||Buffer.byteLength(b.password)>1024) throw new InputError(400,'Confira os campos.');
    const email=b.email.trim().toLowerCase();
    await rateLimit('login-account',email,8,15*60000);
    await rateLimit('login-source',requestSubject(req),40,15*60000);
    const result=await getProductionDb().query('SELECT id,password_hash,active,role FROM users WHERE email=$1',[email]);
    const user=result.rows[0];
    dummyHash ??= hashPassword(randomBytes(32).toString('hex'));
    const valid=await verifyPassword(b.password,user?.password_hash ?? await dummyHash);
    if(!valid||!user?.active) throw new InputError(401,'E-mail ou senha inválidos.');
    await revokeSession();
    await createSession(user.id);
    return Response.json({redirect:user.role==='admin'?'/gestao':'/portal'},{headers:{'Cache-Control':'no-store'}});
  } catch(e) { return failure(e,'login'); }
  finally { activeVerifications--; }
}
