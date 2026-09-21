import {trustedOrigin,InputError} from './request-security';
import {rawDatabase} from '../db/postgres';
import {currentUser} from './auth/session';
export const rawDb=rawDatabase;
export async function identity(){const user=await currentUser();return {user,admin:user?.role==='admin'}}
export const sameOrigin=trustedOrigin;
export function error(message:string,status=400){return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}})}
export function textValue(x:unknown,max=500){if(x===undefined||x===null)return '';if(typeof x!=='string'||x.length>max)throw new InputError(400,'Confira o formato e o tamanho dos campos.');return x.trim()}
export async function publicSettings(){
  try{
    const row=await rawDb().prepare('SELECT value FROM settings WHERE key = ?').bind('public').first<{value:string}>();
    return row?JSON.parse(row.value):{};
  }catch(cause){
    const err=cause as {name?:string;code?:string};
    console.error(JSON.stringify({event:'public_settings_fallback',name:err?.name||'Error',code:err?.code||'UNKNOWN'}));
    return {};
  }
}
