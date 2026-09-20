import {NextResponse} from 'next/server';
import {portfolioCategories,queryPortfolio} from '../../portfolio-data';
export const dynamic='force-dynamic';
export async function GET(request:Request){const query=new URL(request.url).searchParams;const category=query.get('categoria')||'Todos';const search=(query.get('q')||'').slice(0,120);const page=Number(query.get('pagina')||'1');if(!portfolioCategories.includes(category as typeof portfolioCategories[number])||!Number.isSafeInteger(page)||page<1||page>1000)return NextResponse.json({error:'Filtro inválido.'},{status:400});return NextResponse.json(queryPortfolio(category,search,page),{headers:{'Cache-Control':'no-store'}});}
