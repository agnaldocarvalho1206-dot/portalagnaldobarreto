'use client';
import { useState } from 'react';

export function RecoverPasswordForm() {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  return <form onSubmit={async e=>{
    e.preventDefault(); setBusy(true); setMessage(''); setError('');
    const email=String(new FormData(e.currentTarget).get('email')||'');
    try{
      const response=await fetch('/api/auth/recover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||'Não foi possível solicitar a recuperação.');
      setMessage(result.message);
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível solicitar a recuperação.');}
    finally{setBusy(false);}
  }}>
    <label>E-mail<input name="email" type="email" autoComplete="email" maxLength={200} required/></label>
    {message&&<p className="feedback" role="status">{message}</p>}
    {error&&<p className="feedback error" role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy?'Enviando...':'Recuperar senha'}</button>
  </form>;
}
