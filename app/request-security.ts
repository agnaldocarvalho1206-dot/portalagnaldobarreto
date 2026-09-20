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
  const expected = process.env.APP_URL ? new URL(process.env.APP_URL).origin : new URL(req.url).origin;
  return req.headers.get('origin') === expected;
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
  // Nunca registrar payload, identidade, cookies ou o objeto de erro do banco.
  if (status === 503) console.error(JSON.stringify({ operation, event: 'request_failed', requestId: crypto.randomUUID() }));
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
}
