// Isolated integration infrastructure. Never used by the production entrypoint.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import S3rver from 's3rver';
import { mkdir } from 'node:fs/promises';
const root=new URL('../work/integration/',import.meta.url);
await mkdir(root,{recursive:true});
const db=await PGlite.create(new URL('postgres/',root).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const server=new PGLiteSocketServer({db,host:'127.0.0.1',port:55439,maxConnections:12});
await server.start();
const s3=new S3rver({address:'127.0.0.1',port:45699,silent:true,directory:new URL('s3/',root).pathname.replace(/^\/([A-Za-z]:)/,'$1'),configureBuckets:[{name:'portal-test'}]});
await s3.run();
console.log('Serviços de teste isolados: PostgreSQL/PGlite 55439; S3 local 45699.');
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{await s3.close();await server.stop();await db.close();process.exit(0)});
