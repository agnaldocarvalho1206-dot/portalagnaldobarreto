export const MAX_ATTACHMENT=10*1024*1024;
export function validateAttachment(name:string,type:string,bytes:Uint8Array){if(bytes.length===0||bytes.length>MAX_ATTACHMENT)return 'O arquivo deve ter até 10 MB.';const structural=attachmentStructure(name,bytes);if(structural)return structural;const lower=name.toLowerCase();const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);const pdf=String.fromCharCode(...bytes.slice(0,5))==='%PDF-';if(bytes.length===0||bytes.length>MAX_ATTACHMENT)return 'O arquivo deve ter até 10 MB.';if((/\.jpe?g$/.test(lower)&&type==='image/jpeg'&&jpg)||(/\.png$/.test(lower)&&type==='image/png'&&png)||(/\.pdf$/.test(lower)&&type==='application/pdf'&&pdf))return null;return 'Envie um arquivo JPG, PNG ou PDF válido.';}
export async function limitedBody(req:Request,max:number){const reader=req.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw new Error('BODY_TOO_LARGE');}chunks.push(value);}const result=new Uint8Array(total);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;}

// Validação estrutural defensiva. Não substitui antivírus ou quarentena.
function attachmentStructure(name:string,bytes:Uint8Array):string|null {
 const invalid='Arquivo inválido, incompleto ou não permitido.';
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const dimensions=(w:number,h:number)=>w>0&&h>0&&w<=10000&&h<=10000&&w*h<=25000000;
 if(/\.png$/i.test(name)) {
  if(bytes.length<45)return invalid;
  let offset=8,header=false,data=false,end=false;
  while(offset+12<=bytes.length){
   const size=view.getUint32(offset),stop=offset+12+size;
   if(stop>bytes.length)return invalid;
   const type=String.fromCharCode(...bytes.slice(offset+4,offset+8));
   if(!header){if(type!=='IHDR'||size!==13||!dimensions(view.getUint32(offset+8),view.getUint32(offset+12)))return invalid;header=true;}
   let crc=0xffffffff;
   for(let i=offset+4;i<offset+8+size;i++){crc^=bytes[i];for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
   if(((crc^0xffffffff)>>>0)!==view.getUint32(offset+8+size))return invalid;
   if(type==='IDAT'&&size>0)data=true;
   if(type==='IEND'){if(size!==0||stop!==bytes.length)return invalid;end=true;break;}
   offset=stop;
  }
  if(!header||!data||!end)return invalid;
 } else if(/\.jpe?g$/i.test(name)) {
  if(bytes.length<20||bytes.at(-2)!==255||bytes.at(-1)!==217)return invalid;
  let offset=2,frame=false,scan=false;
  while(offset+4<bytes.length){
   if(bytes[offset++]!==255)return invalid;
   while(bytes[offset]===255)offset++;
   const marker=bytes[offset++];
   if(marker===0xda){scan=true;break;}
   if(offset+2>bytes.length)return invalid;
   const size=view.getUint16(offset);if(size<2||offset+size>bytes.length)return invalid;
   if([0xc0,0xc1,0xc2].includes(marker)){if(size<8||!dimensions(view.getUint16(offset+5),view.getUint16(offset+3)))return invalid;frame=true;}
   offset+=size;
  }
  if(!frame||!scan)return invalid;
 } else if(/\.pdf$/i.test(name)) {
  const text=new TextDecoder('latin1').decode(bytes);
  if(!/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(text)||! /startxref\s+\d+\s+%%EOF\s*$/.test(text))return invalid;
  // Recusa recursos ativos comuns; conteúdo comprimido ainda requer scanner externo.
  if(/\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA)\b/.test(text))return 'Envie um PDF sem scripts, ações automáticas ou arquivos incorporados.';
 }
 return null;
}
