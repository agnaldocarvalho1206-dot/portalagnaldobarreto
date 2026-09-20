import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Compatível com a prévia incorporada e os scripts do framework.
  // A política completa de scripts deve ser configurada com nonce na hospedagem.
  if(!request.nextUrl.pathname.startsWith('/api/contact-attachment')) response.headers.set('Content-Security-Policy', "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'");
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  }
  return response;
}
