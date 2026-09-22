import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { readJsonObject, trustedOrigin, failure, InputError } from '../../../request-security';
import { rateLimit, requestSubject } from '../../../rate-limit';

export async function POST(req: Request) {
  if (!trustedOrigin(req)) return Response.json({ error: 'Origem não permitida.' }, { status: 403 });
  try {
    const body = await readJsonObject(req, 4096);
    if (typeof body.email !== 'string' || body.email.length > 200 || typeof body.password !== 'string' || body.password.length > 1024)
      throw new InputError(400, 'Confira os campos.');
    const email = body.email.trim().toLowerCase();
    await rateLimit('login-account', email, 8, 15 * 60000);
    await rateLimit('login-source', requestSubject(req), 40, 15 * 60000);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: body.password });
    if (error || !data.user) throw new InputError(401, 'E-mail ou senha inválidos.');
    const { data: profile } = await supabase.from('profiles').select('role,active').eq('id', data.user.id).single();
    if (!profile?.active) {
      await supabase.auth.signOut();
      throw new InputError(403, 'Acesso desativado.');
    }
    const redirect = profile.role === 'admin' || profile.role === 'staff' ? '/gestao' : '/portal';
    return Response.json({ redirect }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return failure(e, 'login'); }
}
