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
    const detail=(await response.clone().text()).slice(0,1000);
    throw new Error(path+' retornou '+response.status+'; esperado '+allowed.join('/')+(detail?' | '+detail:''));
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

async function waitForCurrentDeployment(){
  const url=new URL('/api/health/ready',base);
  let lastStatus=0,lastBody='';
  for(let attempt=1;attempt<=20;attempt++){
    const response=await fetch(url,{
      redirect:'manual',
      headers:{
        'User-Agent':'Portal-AB-Homologation/1.0',
        'Cache-Control':'no-cache',
      },
    });
    lastStatus=response.status;
    lastBody=(await response.text()).slice(0,1000);
    let body;
    try{body=JSON.parse(lastBody)}catch{body=null;}

    const checks=body?.checks;
    const currentContract=checks
      && ['database','storage','auth'].every(key=>['ok','unavailable'].includes(checks[key]));

    if(currentContract){
      checked.set(url.pathname,response.status);
      if(response.status!==200||body.status!=='ready'){
        throw new Error('/api/health/ready confirmou deploy atual, mas dependências não estão prontas | '+lastBody);
      }
      return body;
    }

    if(attempt<20)await new Promise(resolve=>setTimeout(resolve,15000));
  }
  throw new Error(
    'Produção não atualizou para o contrato de readiness H12 após as tentativas de homologação'
    +' | último status '+lastStatus+(lastBody?' | '+lastBody:''),
  );
}

const readyJson=await waitForCurrentDeployment();
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

function cookieHeader(response){
  const values=typeof response.headers.getSetCookie==='function'?response.headers.getSetCookie():[];
  return values.map(value=>value.split(';',1)[0]).join('; ');
}

async function authenticatedSmoke(label,email,password,expectedRole){
  if(!email&&!password)return {status:'not-configured'};
  if(!email||!password)throw new Error(label+': configure e-mail e senha juntos.');

  const login=await fetch(new URL('/api/auth/login',base),{
    method:'POST',
    redirect:'manual',
    headers:{
      Origin:base.origin,
      'Content-Type':'application/json',
      'User-Agent':'Portal-AB-Homologation/1.0',
    },
    body:JSON.stringify({email,password,returnTo:expectedRole==='client'?'/portal':'/gestao'}),
  });
  if(login.status!==200)throw new Error(label+': login retornou '+login.status);
  const loginData=await login.json();
  const cookie=cookieHeader(login);
  if(!cookie)throw new Error(label+': login não retornou cookie de sessão.');

  const portal=await fetch(new URL('/api/portal',base),{
    headers:{Origin:base.origin,Cookie:cookie,'User-Agent':'Portal-AB-Homologation/1.0'},
  });
  if(portal.status!==200)throw new Error(label+': /api/portal retornou '+portal.status);
  const portalData=await portal.json();
  if(portalData.role!==expectedRole)throw new Error(label+': papel retornado foi '+portalData.role+' em vez de '+expectedRole);

  if(expectedRole==='client'){
    if(!portalData.clientPortal)throw new Error(label+': conta cliente não está vinculada ao CRM.');
    const management=await fetch(new URL('/gestao',base),{
      headers:{Cookie:cookie,'User-Agent':'Portal-AB-Homologation/1.0'},
    });
    if(management.status!==200)throw new Error(label+': verificação de /gestao retornou '+management.status);
    const html=await management.text();
    if(!html.includes('Acesso administrativo restrito'))throw new Error(label+': cliente não recebeu bloqueio explícito em /gestao.');
  }

  if(expectedRole==='admin'&&loginData.redirect!=='/gestao')throw new Error(label+': administrador não foi direcionado à gestão.');
  if(expectedRole==='client'&&loginData.redirect!=='/portal')throw new Error(label+': cliente não foi direcionado ao portal.');

  const logout=await fetch(new URL('/api/auth/logout',base),{
    method:'POST',
    headers:{Origin:base.origin,Cookie:cookie,'User-Agent':'Portal-AB-Homologation/1.0'},
  });
  if(logout.status!==200)throw new Error(label+': logout retornou '+logout.status);

  return {status:'passed',role:expectedRole};
}

const adminAuth=await authenticatedSmoke(
  'admin',
  process.env.HOMOLOGATION_ADMIN_EMAIL,
  process.env.HOMOLOGATION_ADMIN_PASSWORD,
  'admin',
);
const clientAuth=await authenticatedSmoke(
  'client',
  process.env.HOMOLOGATION_CLIENT_EMAIL,
  process.env.HOMOLOGATION_CLIENT_PASSWORD,
  'client',
);

console.log(JSON.stringify({
  event:'deployment_homologation_passed',
  origin:base.origin,
  checkedRoutes:checked.size,
  live:'ok',
  ready:'ready',
  protectedAreas:'redirect-to-login',
  anonymousPortalApi:401,
  authenticated:{admin:adminAuth,client:clientAuth},
}));
