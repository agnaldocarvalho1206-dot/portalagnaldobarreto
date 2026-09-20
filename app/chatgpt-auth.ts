// Compatibility names for existing pages. Never trust upstream identity headers.
import { redirect } from 'next/navigation';
import { currentUser } from './auth/session';
export const getChatGPTUser = currentUser;
export function safeReturn(value: string) { return ['/portal','/gestao'].includes(value) ? value : '/portal'; }
export function chatGPTSignInPath(returnTo: string) { return '/entrar?return_to='+encodeURIComponent(safeReturn(returnTo)); }
export async function requireChatGPTUser(returnTo: string) {
  const user = await currentUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));
  return user;
}
