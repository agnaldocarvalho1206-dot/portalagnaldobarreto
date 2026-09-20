import type { Metadata } from 'next';
import './globals.css';
import './home.css';
import { Header, Footer } from './shell';
export const metadata: Metadata = {title:'Agnaldo Barreto — Design que gera resultados',description:'Sites, lojas virtuais e soluções digitais com estratégia, design e tecnologia. Conheça Agnaldo Barreto e converse sobre seu projeto.',openGraph:{title:'Agnaldo Barreto — Web Designer',description:'Estratégia, design e tecnologia para transformar ideias em resultados.',type:'website',locale:'pt_BR'},icons:{icon:'/monograma.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body><a className="skip" href="#conteudo">Pular para o conteúdo</a><Header/>{children}<Footer/></body></html>}
