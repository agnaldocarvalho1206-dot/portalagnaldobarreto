import { redirect } from 'next/navigation';
import { currentUser } from './auth/session';
import { signInPath } from './auth/redirect';

export async function requirePortalUser(returnTo: string) {
  const user = await currentUser();
  if (!user) redirect(signInPath(returnTo));
  return user;
}
