import process from 'node:process';

const baseValue=process.env.EASYPANEL_API_URL;
const token=process.env.EASYPANEL_API_TOKEN;
const projectName=process.env.EASYPANEL_PROJECT_NAME || 'portal-agnaldobarreto';
const serviceName=process.env.EASYPANEL_SERVICE_NAME || 'portal-agnaldobarretoapp';

if(!baseValue || !token){
  console.log(JSON.stringify({event:'easypanel_start_skipped',reason:'api_credentials_not_configured'}));
  process.exit(0);
}

let base;
try{base=new URL(baseValue)}catch{
  console.error('EASYPANEL_API_URL inválida.');
  process.exit(2);
}
if(base.protocol!=='https:'){
  console.error('EASYPANEL_API_URL deve usar HTTPS para proteger o bearer token.');
  process.exit(2);
}
if(base.username || base.password || base.search || base.hash){
  console.error('EASYPANEL_API_URL deve ser apenas a origem HTTPS do painel.');
  process.exit(2);
}

const url=new URL('/api/startAppService',base.origin);
try{
  const response=await fetch(url,{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${token}`,
      'Content-Type':'application/json',
      'User-Agent':'Portal-AB-Deploy/1.0',
    },
    body:JSON.stringify({projectName,serviceName}),
  });
  if(!response.ok){
    console.error('EasyPanel recusou o start do serviço com status '+response.status+'.');
    process.exit(1);
  }
  console.log(JSON.stringify({event:'easypanel_service_started',projectName,serviceName,status:response.status}));
}catch{
  console.error('Não foi possível iniciar o serviço no EasyPanel.');
  process.exit(1);
}
