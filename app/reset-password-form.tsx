'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export function ResetPasswordForm(){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <form onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError('');
    const data=new FormData(e.currentTarget),password=String(data.get('password')||''),confirm=String(data.get('confirm')||'');
    if(password.length<10){setError('Use uma senha com pelo menos 10 caracteres.');setBusy(false);return;}
    if(password!==confirm){setError('As senhas não conferem.');setBusy(false);return;}
    const {error}=await createSupabaseBrowserClient().auth.updateUser({password});
    if(error){setError('Não foi possível redefinir a senha. Solicite um novo link.');setBusy(false);return;}
    location.assign('/entrar');
  }}>
    <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={10} required/></label>
    <label>Confirmar senha<input name="confirm" type="password" autoComplete="new-password" minLength={10} required/></label>
    {error&&<p className="feedback error" role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy?'Salvando...':'Definir nova senha'}</button>
  </form>;
}
