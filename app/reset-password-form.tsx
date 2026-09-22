'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

export function ResetPasswordForm(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
  useEffect(()=>{
    let active=true;
    const supabase=createSupabaseBrowserClient();
    const prepare=async()=>{
      const url=new URL(window.location.href);
      const code=url.searchParams.get('code');
      if(code){
        const {error}=await supabase.auth.exchangeCodeForSession(code);
        if(error){if(active)setError('Este link de recuperação é inválido ou expirou. Solicite um novo link.');return;}
        url.searchParams.delete('code');
        window.history.replaceState({},'',url.pathname+url.search);
      }
      const {data}=await supabase.auth.getSession();
      if(!active)return;
      if(data.session)setReady(true);
      else setError('Abra esta página pelo link de recuperação enviado ao seu e-mail.');
    };
    prepare();
    return()=>{active=false};
  },[]);
  return <form onSubmit={async e=>{
    e.preventDefault();if(!ready)return;setBusy(true);setError('');
    const data=new FormData(e.currentTarget),password=String(data.get('password')||''),confirm=String(data.get('confirm')||'');
    if(password.length<10){setError('Use uma senha com pelo menos 10 caracteres.');setBusy(false);return;}
    if(password!==confirm){setError('As senhas não conferem.');setBusy(false);return;}
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.auth.updateUser({password});
    if(error){setError('Não foi possível redefinir a senha. Solicite um novo link.');setBusy(false);return;}
    await supabase.auth.signOut();
    location.assign('/entrar');
  }}>
    <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={10} required disabled={!ready}/></label>
    <label>Confirmar senha<input name="confirm" type="password" autoComplete="new-password" minLength={10} required disabled={!ready}/></label>
    {error&&<p className="feedback error" role="alert">{error}</p>}
    {!ready&&!error&&<p className="feedback" role="status">Validando link de recuperação...</p>}
    <button className="button" disabled={busy||!ready}>{busy?'Salvando...':'Definir nova senha'}</button>
  </form>;
}
