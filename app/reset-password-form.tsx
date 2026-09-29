'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import {newPasswordError,PASSWORD_MIN_LENGTH} from './password-policy';

export function ResetPasswordForm(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(false);
  useEffect(()=>{
    let active=true;
    const supabase=createSupabaseBrowserClient();
    const prepare=async()=>{
      const url=new URL(window.location.href);
      const code=url.searchParams.get('code');
      let authError:Error|null=null;

      if(code){
        const result=await supabase.auth.exchangeCodeForSession(code);
        authError=result.error;
      }else{
        // Compatibilidade com links de recovery no fluxo implicit/hash do Supabase.
        const hash=new URLSearchParams(url.hash.replace(/^#/,''));
        const accessToken=hash.get('access_token');
        const refreshToken=hash.get('refresh_token');
        const type=hash.get('type');
        if(accessToken&&refreshToken&&(!type||type==='recovery')){
          const result=await supabase.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
          authError=result.error;
        }
      }

      if(authError){
        if(active)setError('Este link de recuperação é inválido ou expirou. Solicite um novo link.');
        return;
      }

      // Remove tokens/código sensíveis da barra de endereço assim que a sessão é criada.
      if(code||url.hash){
        window.history.replaceState({},'',url.pathname);
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
    const policyError=newPasswordError(password);if(policyError){setError(policyError);setBusy(false);return;}
    if(password!==confirm){setError('As senhas não conferem.');setBusy(false);return;}
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.auth.updateUser({password});
    if(error){setError('Não foi possível redefinir a senha. Solicite um novo link.');setBusy(false);return;}
    await supabase.auth.signOut();
    location.assign('/entrar');
  }}>
    <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} aria-describedby="password-rules" required disabled={!ready}/><small id="password-rules">Use 12+ caracteres com maiúscula, minúscula, número e símbolo.</small></label>
    <label>Confirmar senha<input name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} required disabled={!ready}/></label>
    {error&&<p className="feedback error" role="alert">{error}</p>}
    {!ready&&!error&&<p className="feedback" role="status">Validando link de recuperação...</p>}
    <button className="button" disabled={busy||!ready}>{busy?'Salvando...':'Definir nova senha'}</button>
  </form>;
}
