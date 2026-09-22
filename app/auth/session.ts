import { createSupabaseServerClient } from '../../lib/supabase/server';

export type PortalRole = 'admin' | 'staff' | 'client';

export async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,role,active')
    .eq('id', user.id)
    .single();
  if (!profile?.active) return null;
  return {
    userId: user.id,
    email: user.email ?? '',
    displayName: profile.full_name || user.email?.split('@')[0] || 'Usuário',
    fullName: profile.full_name || '',
    role: profile.role as PortalRole,
  };
}

export async function revokeSession() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
