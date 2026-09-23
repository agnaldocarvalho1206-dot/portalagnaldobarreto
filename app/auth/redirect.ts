export type PortalAccessRole = 'admin' | 'staff' | 'client';

export function safePortalReturn(value: unknown): '/portal' | '/gestao' | null {
  return value === '/portal' || value === '/gestao' ? value : null;
}

export function loginRedirect(role: unknown, requested: unknown): '/portal' | '/gestao' {
  const operator = role === 'admin' || role === 'staff';
  const safe = safePortalReturn(requested);
  if (safe === '/gestao' && !operator) return '/portal';
  if (safe) return safe;
  return operator ? '/gestao' : '/portal';
}

export function signInPath(returnTo: unknown) {
  const safe = safePortalReturn(returnTo) ?? '/portal';
  return '/entrar?return_to=' + encodeURIComponent(safe);
}
