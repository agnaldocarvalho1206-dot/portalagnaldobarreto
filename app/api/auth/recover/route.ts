import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { readJsonObject, trustedOrigin, failure, InputError } from '../../../request-security';
import { rateLimit, requestSubject } from '../../../rate-limit';

export async function POST(req: Request) {
  if (!trustedOrigin(req)) return Response.json({ error: 'Origem não permitida.' }, { status: 403 });
  try {
    const body = await readJsonObject(req, 2048);
    if (typeof body.email !== 'string' || body.email.length > 200) throw new InputError(400, 'Informe um e-mail válido.');
    const email = body.email.trim().toLowerCase();
    await rateLimit('password-recovery-account', email, 4, 30 * 60000);
    await rateLimit('password-recovery-source', requestSubject(req), 20, 30 * 60000);
    const origin = process.env.APP_URL ? new URL(process.env.APP_URL).origin : (() => { const host=req.headers.get('x-forwarded-host')||req.headers.get('host'); const proto=req.headers.get('x-forwarded-proto')||'https'; return host ? `${proto}://${host}` : new URL(req.url).origin; })();
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/redefinir-senha' });
    return Response.json({ ok: true, message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return failure(e, 'password-recovery'); }
}
