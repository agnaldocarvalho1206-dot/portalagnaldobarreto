import { spawn } from 'node:child_process';
import { validateProductionConfig } from '../lib/production-config.mjs';
validateProductionConfig();
const env={...process.env,NODE_ENV:'production',HOSTNAME:process.env.HOSTNAME||'0.0.0.0',PORT:process.env.PORT||'3000'};
const child=spawn(process.execPath,['.next/standalone/server.js'],{stdio:'inherit',env});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
child.on('error',()=>{console.error('Não foi possível iniciar. Execute npm run build primeiro.');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
