import { createHmac } from 'node:crypto';
import { getProductionDb } from '../db/postgres';
import { InputError } from './request-security';
export async function rateLimit(scope: string, subject: string, limit: number, windowMs: number) {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret || secret.length < 32) throw new Error('RATE_LIMIT_HMAC_SECRET não configurado.');
  const key = scope+':'+createHmac('sha256',secret).update(subject).digest('hex'), now = Date.now(), db = getProductionDb();
  const result = await db.query(`INSERT INTO rate_limits(key,count,expires) VALUES($1,1,$2)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires <= $3 THEN 1 ELSE rate_limits.count+1 END,
    expires=CASE WHEN rate_limits.expires <= $3 THEN excluded.expires ELSE rate_limits.expires END
    WHERE rate_limits.expires <= $3 OR rate_limits.count < $4 RETURNING key`, [key,now+windowMs,now,limit]);
  if (!result.rowCount) throw new InputError(429,'Muitas tentativas. Aguarde e tente novamente.');
  await db.query('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires < $1 LIMIT 50)',[now-86400000]);
}
export function requestSubject(req: Request) {
  // Enable only behind a reverse proxy that strips and overwrites x-real-ip.
  return process.env.TRUST_PROXY === 'true' ? (req.headers.get('x-real-ip') || 'unknown').slice(0,64) : 'shared';
}
