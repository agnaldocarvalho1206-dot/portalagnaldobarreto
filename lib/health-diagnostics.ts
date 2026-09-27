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
