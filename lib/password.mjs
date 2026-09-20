import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
const derive = (password, salt) => new Promise((resolve, reject) => {
  scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256*1024*1024 }, (error, key) => error ? reject(error) : resolve(key));
});
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 1024) throw new Error('Use uma senha com pelo menos 12 caracteres e até 1024 bytes.');
  const salt = randomBytes(32).toString('hex'), key = await derive(password, salt);
  return 'scrypt$'+salt+'$'+key.toString('hex');
}
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || Buffer.byteLength(password) > 1024 || typeof stored !== 'string') return false;
  const match = /^scrypt\$([a-f0-9]{64})\$([a-f0-9]{128})$/.exec(stored);
  if (!match) return false;
  const key = await derive(password, match[1]);
  return timingSafeEqual(key, Buffer.from(match[2], 'hex'));
}
