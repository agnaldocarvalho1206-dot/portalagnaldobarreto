import {failure} from '../../request-security';
import {rateLimit} from '../../rate-limit';
import {MAX_ATTACHMENT,limitedBody,validateAttachment} from '../../contact-upload';
import {privateBucket} from '../../storage/s3';
import {identity,rawDb,error,sameOrigin,textValue} from '../../server';

const keyPattern=/^documents\/[a-f0-9-]{36}$/;

export async function POST(req:Request){
  const {user,operator}=await identity();
  if(!user)return error('Entre para enviar documentos.',401);
  if(!operator)return error('Acesso operacional necessário.',403);
  if(!sameOrigin(req))return error('Origem não permitida.',403);

  let uploadedKey='';
  try{
    await rateLimit('portal-document-upload',user.userId,12,60000);
    const contentType=req.headers.get('content-type')||'';
    if(!contentType.toLowerCase().startsWith('multipart/form-data;'))return error('Envie o documento pelo formulário.',415);

    const raw=await limitedBody(req,MAX_ATTACHMENT+65536);
    const form=await new Response(raw,{headers:{'Content-Type':contentType}}).formData();
    const file=form.get('file');
    if(!(file instanceof File)||!file.size)return error('Selecione um arquivo.',400);

    const title=textValue(form.get('title'),180);
    if(!title)return error('Informe o título do documento.');
    const documentTypeRaw=textValue(form.get('documentType'),40);
    const documentType=['Contrato','Proposta','Briefing','Relatório','Comprovante','Outro'].includes(documentTypeRaw)?documentTypeRaw:'Outro';
    const requestedClientId=textValue(form.get('clientId'),40)||null;
    const projectId=textValue(form.get('projectId'),40)||null;
    const notes=textValue(form.get('notes'),2000);

    const bytes=new Uint8Array(await file.arrayBuffer());
    const invalid=validateAttachment(file.name,file.type,bytes);
    if(invalid)return error(invalid,400);

    const db=rawDb();
    let clientId=requestedClientId;

    if(projectId){
      const project=await db.prepare('SELECT id,client_id FROM client_projects WHERE id=?').bind(projectId).first<{id:string,client_id:string|null}>();
      if(!project)return error('Projeto não encontrado.',404);
      if(clientId&&project.client_id&&project.client_id!==clientId)return error('O projeto pertence a outro cliente.',409);
      clientId=clientId||project.client_id||null;
    }

    if(clientId){
      const client=await db.prepare('SELECT id FROM crm_clients WHERE id=?').bind(clientId).first<{id:string}>();
      if(!client)return error('Cliente não encontrado.',404);
    }

    const id=crypto.randomUUID(),now=Date.now();
    uploadedKey='documents/'+crypto.randomUUID();
    const safeName=file.name.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(0,120)||'documento';
    await privateBucket.put(uploadedKey,bytes,{
      httpMetadata:{contentType:'application/octet-stream'},
      customMetadata:{
        documentId:id,
        clientId:clientId||'',
        filename:safeName,
        originalType:file.type,
      },
    });

    const fileUrl='/api/portal-document?id='+encodeURIComponent(id)+'&key='+encodeURIComponent(uploadedKey);
    try{
      await db.prepare('INSERT INTO portal_documents (id,client_id,project_id,title,document_type,file_url,notes,status,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .bind(id,clientId,projectId,title,documentType,fileUrl,notes,'Ativo',now,now).run();
    }catch(e){
      await privateBucket.delete(uploadedKey).catch(()=>{});
      uploadedKey='';
      throw e;
    }

    uploadedKey='';
    return Response.json({id,fileUrl},{status:201,headers:{'Cache-Control':'no-store'}});
  }catch(e){
    if(uploadedKey)await privateBucket.delete(uploadedKey).catch(()=>{});
    if(e instanceof Error&&e.message==='BODY_TOO_LARGE')return error('O arquivo ultrapassa o limite de 10 MB.',413);
    return failure(e,'portal document upload');
  }
}

export async function GET(req:Request){
  const {user,operator}=await identity();
  if(!user)return error('Entre para acessar o documento.',401);

  const query=new URL(req.url).searchParams;
  const id=query.get('id')||'',key=query.get('key')||'';
  if(!id||!keyPattern.test(key))return error('Documento não encontrado.',404);

  try{
    const db=rawDb();
    const document=await db.prepare('SELECT id,client_id,status FROM portal_documents WHERE id=?').bind(id).first<{id:string,client_id:string|null,status:string}>();
    if(!document||document.status==='Arquivado')return error('Documento não encontrado.',404);

    if(!operator){
      const client=await db.prepare('SELECT id FROM crm_clients WHERE user_id=? LIMIT 1').bind(user.userId).first<{id:string}>();
      if(!client||!document.client_id||document.client_id!==client.id)return error('Documento não encontrado.',404);
    }

    const object=await privateBucket.get(key);
    if(!object||object.customMetadata?.documentId!==id)return error('Documento não encontrado.',404);
    if(document.client_id&&(object.customMetadata?.clientId||'')!==document.client_id)return error('Documento não encontrado.',404);

    const name=(object.customMetadata?.filename||'documento').replace(/[^a-zA-Z0-9._ -]/g,'_');
    return new Response(object.body,{headers:{
      'Content-Type':'application/octet-stream',
      'Content-Disposition':'attachment; filename="'+name+'"',
      'X-Content-Type-Options':'nosniff',
      'Content-Security-Policy':"default-src 'none'; sandbox",
      'Cache-Control':'private, no-store',
    }});
  }catch(e){
    return failure(e,'portal document download');
  }
}
