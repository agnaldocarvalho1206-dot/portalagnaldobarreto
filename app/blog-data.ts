import {posts} from './content';
export const blogTopics=['WordPress','Elementor Pro','Crocoblock','E-commerce','SEO','Design','Estratégia'];
export const blogEntries=posts.map((p,index)=>({...p,publishedAt:'2026-09-12',author:'Redação Portal AB',featured:index!==1,tags:index===0?['Estratégia']:index===1?['Design']:['Design','Estratégia'],imageIndex:index,image:'/blog-reference.png'}));
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
export function queryBlog(topic='Todos',search='',page=1){const filtered=blogEntries.filter(p=>(topic==='Todos'||p.tags.includes(topic)||p.category===topic)&&normalize([p.title,p.summary,p.category,...p.tags].join(' ')).includes(normalize(search.trim())));return {items:filtered.slice((page-1)*6,page*6).map(({sections,...card})=>card),total:filtered.length,page,hasMore:page*6<filtered.length};}
export const blogCounts=Object.fromEntries(['Todos',...blogTopics].map(t=>[t,queryBlog(t).total]));
export type BlogResult=ReturnType<typeof queryBlog>;
