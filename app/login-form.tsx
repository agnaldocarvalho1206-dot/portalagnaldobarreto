'use client';
import { useState } from 'react';
export function LoginForm() {
  const [busy,setBusy]=useState(false), [error,setError]=useState('');
  return <form onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError('');
    const data=Object.fromEntries(new FormData(e.currentTarget));
    try {
      const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Não foi possível entrar.');
      location.assign(result.redirect==='/gestao'?'/gestao':'/portal');
    } catch(e) {setError(e instanceof Error?e.message:'Não foi possível entrar.');setBusy(false);}
  }}>
    <label>E-mail<input name="email" type="email" autoComplete="username" maxLength={200} required/></label>
    <label>Senha<input name="password" type="password" autoComplete="current-password" maxLength={1024} required/></label>
    {error&&<p className="feedback error" role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy?'Entrando...':'Entrar no portal'}</button>
    <p className="note">Precisa de acesso ou de uma nova senha? <a href="/contato">Solicite ao atendimento.</a></p>
  </form>;
}
