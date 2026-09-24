import {NotebookPortrait} from './notebook-portrait';
import {ArrowRight,Monitor,ShoppingCart,PanelsTopLeft,Code2,Target,Users,ShieldCheck,ChartNoAxesCombined,MessagesSquare,FileCheck,FolderOpen} from 'lucide-react';
import {PortfolioExplorer} from './portfolio-explorer';
import {queryPortfolio} from './portfolio-data';
import {publicSettings} from './server';
export default async function ProjectsAB(){const s=await publicSettings();return <main id="conteudo" className="ab-projects-page ab-projects-page-v64">
<section className="container ab-projects-hero-v64 ab-projects-hero-v647">
  <div className="ab-projects-copy-v64 ab-projects-copy-v647">
    <div className="ab-projects-kicker-v647"><span aria-hidden="true"/><div><b>PORTFÓLIO AB</b><small>PROJETOS SELECIONADOS</small></div></div>
    <h1>Projetos que<br/>conectam<br/><em>estratégia,<br/>identidade e<br/>resultado.</em></h1>
    <p>Cada projeto nasce de uma necessidade real e evolui com direção, clareza e atenção aos detalhes.</p>
    <p>Aqui você encontra páginas, lojas, landing pages e portais criados para organizar a experiência digital e fortalecer a presença de cada marca.</p>
    <div className="ab-projects-principles-v647">
      <span><Target size={18}/><b>Estratégia</b></span>
      <span><ShieldCheck size={18}/><b>Qualidade</b></span>
      <span><Users size={18}/><b>Parceria</b></span>
      <span><ChartNoAxesCombined size={18}/><b>Evolução</b></span>
    </div>
    <div className="actions ab-projects-actions-v64 ab-projects-actions-v647">
      <a className="button" href="#portfolio">Ver um projeto <ArrowRight size={18}/></a>
      <a className="button outline" href="#portfolio">Explorar portfólio <FolderOpen size={17}/></a>
    </div>
  </div>
  <div className="ab-projects-visual-v64 ab-projects-visual-v647">
    <img className="ab-projects-globe-v64" src="/digital-globe.png" width="1254" height="1254" alt="" aria-hidden="true"/>
    <div className="ab-projects-id-v64"><span>PORTFÓLIO AB</span><small>PROJETOS SELECIONADOS</small></div>
    <NotebookPortrait className="ab-projects-person-v64" src="/agnaldo.png" width="1862" height="845" alt="Agnaldo Barreto sorrindo à mesa, atrás de seu notebook" fetchPriority="high"/>
    <div className="ab-projects-note-v64">“Do conceito à entrega.<br/><em>Cada tela precisa fazer sentido.</em>”</div>
    <div className="ab-projects-services-v64 ab-projects-services-v647">{[[Monitor,'Sites institucionais'],[ShoppingCart,'Lojas virtuais'],[PanelsTopLeft,'Landing pages'],[Code2,'Portais e sistemas']].map(([Icon,label]:any)=><span key={label}><Icon size={18}/><b>{label}</b></span>)}</div>
  </div>
</section>

<section className="container ab-projects-intro-v64"><div><div className="eyebrow">PROJETOS SELECIONADOS</div><h2>Explore por categoria,<br/><em>tecnologia ou contexto.</em></h2></div><p>A vitrine abaixo reúne projetos publicados no portfólio. Use os filtros para encontrar rapidamente o tipo de experiência que deseja conhecer.</p></section>
<PortfolioExplorer initial={queryPortfolio()}/>

<section className="container ab-projects-authority ab-projects-authority-v64" aria-label="Diferenciais profissionais">{(s.metricsConfirmed?[{Icon:FolderOpen,value:s.projects,label:'Projetos entregues'},{Icon:Users,value:s.clients,label:'Clientes atendidos'},{Icon:ShieldCheck,value:s.satisfaction,label:'Satisfação dos clientes'},{Icon:ChartNoAxesCombined,value:s.experience,label:'De experiência'}]:[{Icon:Target,value:'Estratégia',label:'Soluções com direção'},{Icon:Users,value:'Parceria',label:'Decisões compartilhadas'},{Icon:ShieldCheck,value:'Qualidade',label:'Atenção aos detalhes'},{Icon:ChartNoAxesCombined,value:'Evolução',label:'Visão de continuidade'}]).map(({Icon,value,label},i)=><article key={label}><span>{String(i+1).padStart(2,'0')}</span><Icon size={25}/><div><strong>{value||'—'}</strong><p>{label}</p></div></article>)}</section>

<section className="ab-projects-cta ab-projects-cta-v64"><div className="container ab-projects-cta-inner-v64"><div className="ab-projects-cta-image-v64"><img className="ab-cta-monogram-v64" src="/monograma.png" alt="" aria-hidden="true" width="1254" height="1254" loading="lazy"/><img className="ab-cta-portrait-v64" src="/agnaldo-corporativo.png" alt="Agnaldo Barreto — composição oficial do redesign AB" width="1254" height="1254" loading="lazy"/></div><div className="ab-projects-cta-copy-v64"><div className="eyebrow">SEU PROJETO PODE SER O PRÓXIMO</div><h2>Uma boa solução começa com <em>contexto e direção.</em></h2><p>Conte sua ideia, a necessidade e o momento do seu negócio. Vamos organizar prioridades antes de decidir a melhor solução.</p><a className="button" href="/contato">Iniciar uma conversa <ArrowRight size={18}/></a></div><ul className="ab-projects-benefits-v64">{[[MessagesSquare,'Atendimento próximo'],[Target,'Diagnóstico do cenário'],[FileCheck,'Escopo organizado'],[ShieldCheck,'Acompanhamento das etapas']].map(([Icon,label]:any)=><li key={label}><Icon size={20}/><span>{label}</span></li>)}</ul></div></section>
</main>}