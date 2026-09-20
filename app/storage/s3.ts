import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
let client:S3Client|undefined;
function getClient() {
  const endpoint=process.env.S3_ENDPOINT, accessKeyId=process.env.S3_ACCESS_KEY_ID, secretAccessKey=process.env.S3_SECRET_ACCESS_KEY;
  if(!endpoint||!accessKeyId||!secretAccessKey||!process.env.S3_BUCKET) throw new Error('Armazenamento S3 não configurado.');
  return client ??= new S3Client({endpoint,region:process.env.S3_REGION||'auto',forcePathStyle:process.env.S3_FORCE_PATH_STYLE==='true',credentials:{accessKeyId,secretAccessKey},maxAttempts:2});
}
function validKey(key:string) { if(!/^contact\/[a-f0-9-]{36}$/.test(key)) throw new Error('Chave inválida.'); }
export async function checkStorage(){await getClient().send(new HeadBucketCommand({Bucket:process.env.S3_BUCKET}));}
export const privateBucket={
  async put(key:string,body:Uint8Array,options:{httpMetadata:{contentType:string},customMetadata:Record<string,string>}) {
    validKey(key);
    const metadata=Object.fromEntries(Object.entries(options.customMetadata).map(([k,v])=>[k.toLowerCase(),v]));
    await getClient().send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,Body:body,Metadata:metadata,ContentType:'application/octet-stream'}));
  },
  async get(key:string) {
    validKey(key);
    try {
      const object=await getClient().send(new GetObjectCommand({Bucket:process.env.S3_BUCKET,Key:key}));
      if(!object.Body)return null;
      return {body:new Uint8Array(await object.Body.transformToByteArray()),customMetadata:{filename:object.Metadata?.filename,leadId:object.Metadata?.leadid}};
    } catch(error) {if((error as {name?:string}).name==='NoSuchKey')return null;throw error;}
  },
  async delete(key:string) {validKey(key);await getClient().send(new DeleteObjectCommand({Bucket:process.env.S3_BUCKET,Key:key}));}
};
