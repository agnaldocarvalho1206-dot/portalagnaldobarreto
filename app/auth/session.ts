import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { getProductionDb } from '../../db/postgres';
export const SESSION_COOKIE = 'portal_session';
const lifetime = 8 * 60 * 60 * 1000;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' });
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex'), now = Date.now();
  await getProductionDb().query('INSERT INTO sessions(token_hash,user_id,expires,created) VALUES($1,$2,$3,$4)', [digest(token),userId,now+lifetime,now]);
  await getProductionDb().query('DELETE FROM sessions WHERE expires < $1', [now]);
  (await cookies()).set(SESSION_COOKIE,token,{ ...cookieOptions(), maxAge: lifetime/1000 });
}
export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await getProductionDb().query('SELECT u.id,u.email,u.name,u.role FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires>$2 AND u.active=true', [digest(token),Date.now()]);
  const u = result.rows[0];
  return u ? { userId: u.id as string, email: u.email as string, displayName: u.name as string, fullName: u.name as string, role: u.role as 'admin'|'client' } : null;
}
export async function revokeSession() {
  const jar = await cookies(), token = jar.get(SESSION_COOKIE)?.value;
  if (token) await getProductionDb().query('DELETE FROM sessions WHERE token_hash=$1',[digest(token)]);
  jar.set(SESSION_COOKIE,'',{ ...cookieOptions(), maxAge: 0 });
}
