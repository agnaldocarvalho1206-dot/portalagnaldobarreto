import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/portal','/gestao','/entrar','/recuperar','/redefinir-senha']},sitemap:'https://agnaldobarreto.tech/sitemap.xml',host:'https://agnaldobarreto.tech'};}
