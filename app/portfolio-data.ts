import {projects} from './content';
export const portfolioCategories=['Todos','Institucionais','E-commerce','Sistemas','Landing Pages','Portais'] as const;
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
const filterCategory=(slug:string,category:string)=>slug==='portal-ab'?'Portais':slug==='fortmet'?'Institucionais':slug==='nathuralys'?'E-commerce':category==='Institucional'?'Institucionais':category;
export const portfolioItems=projects.map((p,index)=>({...p,order:index,thumbnail:'/portfolio-reference.png',imageAlt:'Projeto '+p.name,displayCategory:p.slug==='instituto-ive'?'ONG / Projeto social':p.category,filterCategory:filterCategory(p.slug,p.category),concept:false}));
export function queryPortfolio(category='Todos',search='',page=1){const matching=portfolioItems.filter(p=>(category==='Todos'||p.filterCategory===category)&&normalize([p.name,p.short,p.category,...p.tech].join(' ')).includes(normalize(search.trim())));const size=6;return {items:matching.slice((page-1)*size,page*size),total:matching.length,page,hasMore:page*size<matching.length};}
export type PortfolioResult=ReturnType<typeof queryPortfolio>;
