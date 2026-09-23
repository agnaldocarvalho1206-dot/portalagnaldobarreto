export async function checkSupabaseAuth() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada.');
  const url = new URL('/auth/v1/.well-known/jwks.json', base);
  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Supabase Auth indisponível.');
  const payload = await response.json().catch(() => null) as { keys?: unknown[] } | null;
  if (!payload || !Array.isArray(payload.keys)) throw new Error('Resposta inválida do Supabase Auth.');
}
