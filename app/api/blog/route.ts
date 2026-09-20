import {NextResponse} from 'next/server';
import {blogTopics,queryBlog} from '../../blog-data';
export const dynamic='force-dynamic';
export async function GET(request:Request){const params=new URL(request.url).searchParams;const topic=params.get('tema')||'Todos';const page=Number(params.get('pagina')||'1');if(!['Todos',...blogTopics].includes(topic)||!Number.isSafeInteger(page)||page<1||page>1000)return NextResponse.json({error:'Filtros inválidos.'},{status:400});return NextResponse.json(queryBlog(topic,(params.get('q')||'').slice(0,120),page),{headers:{'Cache-Control':'no-store'}});}
