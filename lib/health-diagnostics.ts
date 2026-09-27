type RuntimeError={code?:string;name?:string;message?:string};

function info(error:unknown){
  const e=(error??{}) as RuntimeError;
  return {
    code:String(e.code||'').toUpperCase(),
    name:String(e.name||'').toUpperCase(),
    message:String(e.message||'').toLowerCase(),
  };
}

export function classifyDatabaseFailure(error:unknown){
  const {code,name,message}=info(error);
  if(message.includes('database_url não configurada'))return 'config';
  if(message.includes('migrações pendentes'))return 'migration-pending';
  if(code==='28P01'||message.includes('password authentication failed'))return 'credentials';
  if(code==='3D000')return 'database-missing';
  if(code==='42P01'||code==='42703'||message.includes('client_projects'))return 'schema';
  if(['ECONNREFUSED','EHOSTUNREACH','ENETUNREACH'].includes(code))return 'connection';
  if(code==='ENOTFOUND')return 'dns';
  if(code==='ETIMEDOUT'||name.includes('TIMEOUT'))return 'timeout';
  if(message.includes('certificate')||message.includes('ssl')||message.includes('tls'))return 'tls';
  return 'unknown';
}

export function classifyStorageFailure(error:unknown){
  const {code,name,message}=info(error);
  if(message.includes('armazenamento s3 não configurado'))return 'config';
  if(['ACCESSDENIED','INVALIDACCESSKEYID','SIGNATUREDOESNOTMATCH','FORBIDDEN'].includes(code)||name.includes('ACCESSDENIED'))return 'credentials';
  if(['NOSUCHBUCKET','NOTFOUND'].includes(code)||name.includes('NOSUCHBUCKET'))return 'bucket';
  if(['ECONNREFUSED','EHOSTUNREACH','ENETUNREACH'].includes(code))return 'connection';
  if(code==='ENOTFOUND')return 'dns';
  if(code==='ETIMEDOUT'||name.includes('TIMEOUT'))return 'timeout';
  if(message.includes('certificate')||message.includes('ssl')||message.includes('tls'))return 'tls';
  return 'unknown';
}


export function describeStorageEndpoint(value:string|undefined){
  if(!value)return {provider:'missing',format:'missing'} as const;
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.pathname!=='/'||url.search||url.hash||url.username||url.password){
      return {provider:'invalid',format:'invalid'} as const;
    }
    const host=url.hostname.toLowerCase();
    const r2=/^[a-f0-9]{32}(?:\.(?:eu|us|fedramp))?\.r2\.cloudflarestorage\.com$/;
    if(host.endsWith('.r2.cloudflarestorage.com')){
      return {provider:'cloudflare-r2',format:r2.test(host)?'valid':'invalid'} as const;
    }
    if(host.endsWith('.amazonaws.com')){
      return {provider:'aws-s3',format:'valid'} as const;
    }
    return {provider:'custom',format:'valid'} as const;
  }catch{
    return {provider:'invalid',format:'invalid'} as const;
  }
}
