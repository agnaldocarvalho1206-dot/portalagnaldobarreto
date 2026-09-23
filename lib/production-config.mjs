export function validateProductionConfig(env=process.env) {
  const missing=['APP_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','DATABASE_URL','RATE_LIMIT_HMAC_SECRET','S3_ENDPOINT','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY'].filter(k=>!env[k]);
  if(missing.length) throw new Error('Configure: '+missing.join(', '));
  const app=new URL(env.APP_URL);
  if(app.protocol!=='https:' || app.pathname!=='/' || app.search || app.hash || app.username || app.password) throw new Error('APP_URL deve ser a origem pública HTTPS.');
  const supabase=new URL(env.NEXT_PUBLIC_SUPABASE_URL);
  if(supabase.protocol!=='https:' || supabase.pathname!=='/' || supabase.search || supabase.hash || supabase.username || supabase.password) throw new Error('NEXT_PUBLIC_SUPABASE_URL deve ser uma origem HTTPS válida.');
  if(!String(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).startsWith('sb_publishable_')) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY deve usar uma chave publicável do Supabase.');
  if(!['postgres:','postgresql:'].includes(new URL(env.DATABASE_URL).protocol)) throw new Error('DATABASE_URL deve usar PostgreSQL.');
  if(env.RATE_LIMIT_HMAC_SECRET.length<32) throw new Error('RATE_LIMIT_HMAC_SECRET precisa ter pelo menos 32 caracteres aleatórios.');
  if(new URL(env.S3_ENDPOINT).protocol!=='https:') throw new Error('S3_ENDPOINT deve usar HTTPS.');
  if(!['true','false'].includes(env.DATABASE_SSL||'')) throw new Error('Defina DATABASE_SSL=true ou false explicitamente.');
}
