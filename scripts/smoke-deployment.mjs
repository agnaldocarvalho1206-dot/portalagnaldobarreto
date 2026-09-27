import process from 'node:process';

const value=process.env.HOMOLOGATION_BASE_URL;
if(!value)throw new Error('HOMOLOGATION_BASE_URL não configurada.');
const base=new URL(value);
if(base.protocol!=='https:'||base.pathname!=='/'||base.search||base.hash)throw new Error('Use a origem HTTPS publicada, sem caminho, query ou hash.');

const checked=new Map();

async function request(path,{expected,redirect='manual'}={}){
  const url=new URL(path,base);
  const response=await fetch(url,{redirect,headers:{'User-Agent':'Portal-AB-Homologation/1.0'}});
  const allowed=expected??[200];
  if(!allowed.includes(response.status)){
    throw new Error(path+' retornou '+response.status+'; esperado '+allowed.join('/'));
  }
  checked.set(url.pathname+url.search,response.status);
  return response;
}

const publicRoutes=['/','/sobre','/projetos','/servicos','/blog','/contato','/depoimentos','/privacidade','/entrar','/recuperar'];

for(const path of publicRoutes){
  const response=await request(path,{expected:[200]});
  const html=await response.text();

  if(!html.toLowerCase().includes('<html'))throw new Error(path+' não retornou HTML.');
  if(!response.headers.get('x-content-type-options')?.toLowerCase().includes('nosniff'))throw new Error(path+' sem X-Content-Type-Options.');
  if(!response.headers.get('content-security-policy'))throw new Error(path+' sem Content-Security-Policy.');
  if(!response.headers.get('strict-transport-security'))throw new Error(path+' sem HSTS.');

  for(const match of html.matchAll(/href=["']([^"'#]+)["']/g)){
    const href=match[1];
    if(!href.startsWith('/')||href.startsWith('//')||href.startsWith('/api/'))continue;
    const target=new URL(href,base);
    if(target.origin!==base.origin)continue;
    const key=target.pathname+target.search;
    if(checked.has(key))continue;
    const linked=await fetch(target,{redirect:'manual',headers:{'User-Agent':'Portal-AB-Homologation/1.0'}});
    if(linked.status>=400)throw new Error('Link interno quebrado: '+key+' retornou '+linked.status);
    checked.set(key,linked.status);
    if(checked.size>150)throw new Error('Número inesperado de rotas no smoke test.');
  }
}

const live=await request('/api/health/live',{expected:[200]});
const liveJson=await live.json();
if(liveJson.status!=='ok')throw new Error('Liveness não confirmou status ok.');

const ready=await request('/api/health/ready',{expected:[200]});
const readyJson=await ready.json();
if(readyJson.status!=='ready')throw new Error('Readiness não confirmou banco, storage e Supabase.');

for(const path of ['/portal','/gestao']){
  const response=await request(path,{expected:[302,303,307,308]});
  const location=response.headers.get('location')||'';
  if(!location.includes('/entrar'))throw new Error(path+' anônimo não redirecionou para /entrar.');
}

const portalApi=await fetch(new URL('/api/portal',base),{
  redirect:'manual',
  headers:{Origin:base.origin,'User-Agent':'Portal-AB-Homologation/1.0'},
});
if(portalApi.status!==401)throw new Error('/api/portal anônimo retornou '+portalApi.status+' em vez de 401.');

await request('/api/projetos?pagina=0',{expected:[400]});
await request('/api/blog?pagina=0',{expected:[400]});

console.log(JSON.stringify({
  event:'deployment_homologation_passed',
  origin:base.origin,
  checkedRoutes:checked.size,
  live:'ok',
  ready:'ready',
  protectedAreas:'redirect-to-login',
  anonymousPortalApi:401,
}));
