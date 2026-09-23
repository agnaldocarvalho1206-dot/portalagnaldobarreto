import { limitedBody } from './contact-upload';

export class InputError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function trustedOrigin(req: Request) {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return false;
  const configured = process.env.APP_URL ? new URL(process.env.APP_URL).origin : null;
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.replace(':', '');
  if (!forwardedHost) return false;
  const proxyOrigin = `${forwardedProto}://${forwardedHost}`;
  const requestOrigin = req.headers.get('origin');
  // Em produção o navegador fala com o domínio público, enquanto APP_URL pode
  // refletir a origem interna do serviço. Aceite a origem pública reconstruída
  // pelos headers do proxy e, quando configurada, também a origem canônica.
  if (requestOrigin) return requestOrigin === proxyOrigin || requestOrigin === configured;
  if (!['GET','HEAD','OPTIONS'].includes(req.method.toUpperCase())) return false;
  const fetchSite = req.headers.get('sec-fetch-site');
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'none';
}

export async function readJsonObject(req: Request, max = 32768): Promise<Record<string, any>> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new InputError(415, 'Envie dados no formato JSON.');
  }
  const bytes = await limitedBody(req, max);
  let value: unknown;
  try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new InputError(400, 'Dados inválidos.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError(400, 'Dados inválidos.');
  return value as Record<string, any>;
}

export function failure(error: unknown, operation: string) {
  let status = 503;
  let message = 'Não foi possível concluir. Tente novamente.';
  if (error instanceof InputError) { status = error.status; message = error.message; }
  else if (error instanceof SyntaxError) { status = 400; message = 'Dados inválidos.'; }
  else if (error instanceof Error && error.message === 'BODY_TOO_LARGE') { status = 413; message = 'O envio ultrapassou o tamanho permitido.'; }
  // Nunca registrar payload, identidade, cookies, SQL ou o objeto completo de erro do banco.
  if (status === 503) {
    const safe = error && typeof error === 'object' ? error as { name?: unknown; code?: unknown; routine?: unknown } : {};
    const errorName = typeof safe.name === 'string' ? safe.name.slice(0, 80) : 'UnknownError';
    const errorCode = typeof safe.code === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(safe.code) ? safe.code : undefined;
    const errorRoutine = typeof safe.routine === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(safe.routine) ? safe.routine : undefined;
    console.error(JSON.stringify({ operation, event: 'request_failed', requestId: crypto.randomUUID(), errorName, ...(errorCode ? { errorCode } : {}), ...(errorRoutine ? { errorRoutine } : {}) }));
  }
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
}
