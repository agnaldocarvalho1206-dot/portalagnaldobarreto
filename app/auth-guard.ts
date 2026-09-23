import { redirect } from 'next/navigation';
import { currentUser } from './auth/session';

export function safeReturn(value: string) {
  return ['/portal', '/gestao'].includes(value) ? value : '/portal';
}

export function signInPath(returnTo: string) {
  return '/entrar?return_to=' + encodeURIComponent(safeReturn(returnTo));
}

export async function requirePortalUser(returnTo: string) {
  const user = await currentUser();
  if (!user) redirect(signInPath(returnTo));
  return user;
}
