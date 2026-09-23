import 'server-only';
import {rawDatabase} from '../db/postgres';
import {blogEntries,blogTopics} from './blog-data';

export type PublicBlogPost={slug:string,title:string,category:string,summary:string,minutes:string,publishedAt:string,author:string,featured:boolean,tags:string[],imageIndex:number,image:string,body:string,seoTitle?:string,seoDescription?:string};
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');

async function databasePosts():Promise<PublicBlogPost[]>{
 try{
  const rows=(await rawDatabase().prepare("SELECT title,slug,summary,category,body,minutes,seo_title,seo_description,published_at FROM portal_contents WHERE status='Publicado' AND content_type='Post' AND slug<>'' ORDER BY published_at DESC, updated DESC LIMIT 500").all()).results as any[];
  return rows.map((p,index)=>({slug:String(p.slug),title:String(p.title),category:String(p.category||'Estratégia'),summary:String(p.summary||''),minutes:String(p.minutes||'3 min'),publishedAt:String(p.published_at||''),author:'Agnaldo Barreto',featured:index<3,tags:[String(p.category||'Estratégia')],imageIndex:index%3,image:'/blog-reference.png',body:String(p.body||''),seoTitle:String(p.seo_title||''),seoDescription:String(p.seo_description||'')}));
 }catch(error){console.error(JSON.stringify({event:'public_blog_database_error'}));return []}
}
export async function publicBlogEntries(){const dynamic=await databasePosts();const slugs=new Set(dynamic.map(p=>p.slug));return [...dynamic,...blogEntries.filter(p=>!slugs.has(p.slug)).map(p=>({...p,body:p.sections.map(([title,text])=>title+'\n'+text).join('\n\n')}))];}
export async function queryPublicBlog(topic='Todos',search='',page=1){const entries=await publicBlogEntries();const filtered=entries.filter(p=>(topic==='Todos'||p.tags.includes(topic)||p.category===topic)&&normalize([p.title,p.summary,p.category,...p.tags].join(' ')).includes(normalize(search.trim())));return {items:filtered.slice((page-1)*6,page*6).map(({body,...card})=>card),total:filtered.length,page,hasMore:page*6<filtered.length};}
export async function publicBlogCounts(){const entries=await publicBlogEntries();return Object.fromEntries(['Todos',...blogTopics].map(t=>[t,entries.filter(p=>t==='Todos'||p.tags.includes(t)||p.category===t).length]));}
export async function publicBlogPost(slug:string){return (await publicBlogEntries()).find(p=>p.slug===slug)||null;}
