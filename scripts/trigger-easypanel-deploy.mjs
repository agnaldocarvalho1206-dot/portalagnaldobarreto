import process from 'node:process';

const value=process.env.EASYPANEL_DEPLOY_TRIGGER_URL;
if(!value){
  console.error('EASYPANEL_DEPLOY_TRIGGER_URL não configurada.');
  process.exit(2);
}

let url;
try{url=new URL(value)}catch{
  console.error('EASYPANEL_DEPLOY_TRIGGER_URL inválida.');
  process.exit(2);
}

if(url.protocol!=='https:'){
  console.error('EASYPANEL_DEPLOY_TRIGGER_URL deve usar HTTPS.');
  process.exit(2);
}

try{
  const response=await fetch(url,{
    method:'GET',
    redirect:'follow',
    headers:{'User-Agent':'Portal-AB-Deploy/1.0'},
  });
  if(!response.ok){
    console.error('EasyPanel recusou o gatilho de deploy com status '+response.status+'.');
    process.exit(1);
  }
  console.log(JSON.stringify({event:'easypanel_deploy_triggered',status:response.status}));
}catch{
  console.error('Não foi possível acionar o gatilho de deploy do EasyPanel.');
  process.exit(1);
}
