import type {MetadataRoute} from 'next';
import {publicBlogPosts} from './blog-public';
const base='https://agnaldobarreto.tech';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const now=new Date();
 const staticPaths=['','/sobre','/projetos','/servicos','/blog','/contato'];
 const staticEntries=staticPaths.map(path=>({url:base+path,lastModified:now,changeFrequency:(path==='/blog'?'weekly':'monthly') as 'weekly'|'monthly',priority:path===''?1:path==='/blog'?0.9:0.8}));
 const posts=await publicBlogPosts();
 const postEntries=posts.map(post=>({url:base+'/blog/'+encodeURIComponent(post.slug),lastModified:post.publishedAt?new Date(post.publishedAt):now,changeFrequency:'monthly' as const,priority:0.7}));
 return [...staticEntries,...postEntries];
}
