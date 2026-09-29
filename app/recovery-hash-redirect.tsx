'use client';

import { useEffect } from 'react';

export function RecoveryHashRedirect() {
  useEffect(() => {
    if (!window.location.hash) return;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const isRecovery =
      hash.get('type') === 'recovery' &&
      Boolean(hash.get('access_token')) &&
      Boolean(hash.get('refresh_token'));

    if (isRecovery && window.location.pathname !== '/redefinir-senha') {
      window.location.replace('/redefinir-senha' + window.location.hash);
    }
  }, []);

  return null;
}
