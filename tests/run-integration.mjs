import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
const env={...process.env,DATABASE_URL:'postgresql://postgres@127.0.0.1:55439/postgres',DATABASE_SSL:'false',DATABASE_POOL_MAX:'1',APP_URL:'http://127.0.0.1:5317',HOSTNAME:'127.0.0.1',PORT:'5317',NODE_ENV:'production',TEST_PRODUCTION:'true',RATE_LIMIT_HMAC_SECRET:randomBytes(32).toString('hex'),S3_ENDPOINT:'http://127.0.0.1:45699',S3_REGION:'us-east-1',S3_BUCKET:'portal-test',S3_ACCESS_KEY_ID:'S3RVER',S3_SECRET_ACCESS_KEY:'S3RVER',S3_FORCE_PATH_STYLE:'true',TRUST_PROXY:'false'};
env.MIGRATION_DATABASE_URL=env.DATABASE_URL;
const run=(file)=>new Promise((resolve,reject)=>{const c=spawn(process.execPath,[file],{env,stdio:'inherit'});c.on('error',reject);c.on('exit',code=>code===0?resolve():reject(new Error(file+' falhou ('+code+')')));});
const start=(file,marker)=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--v8-pool-size=1',file],{env,stdio:['ignore','pipe','pipe']});
  const timer=setTimeout(()=>{child.kill();reject(new Error('Timeout: '+file));},60000);
  child.on('error',reject);
  child.stdout.on('data',data=>{process.stdout.write(data);if(data.toString().includes(marker)){clearTimeout(timer);resolve(child);}});
  child.stderr.on('data',data=>process.stderr.write(data));
  child.on('exit',code=>{clearTimeout(timer);if(code)reject(new Error(file+' terminou: '+code));});
});
let services,app;
try {
  services=await start('tests/start-services.mjs','Serviços de teste isolados');
  await run('scripts/migrate-postgres.mjs');
  await run('scripts/migrate-postgres.mjs');
  // Only this test harness serves production output on plain loopback HTTP.
  // The production entrypoint requires HTTPS configuration.
  app=await start('.next/standalone/server.js','Ready');
  await run('tests/http-integration.mjs');
} catch(e){console.error(e.message);process.exitCode=1;}
finally {app?.kill();services?.kill();}
