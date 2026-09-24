import {NotebookPortrait} from './notebook-portrait';
import {ArrowRight,Target,Eye,Gem,Check,Monitor,ShoppingCart,PanelsTopLeft,FolderOpen,Code2,Wrench,MessagesSquare,GraduationCap,Search,Lightbulb,Settings,FileText,ShieldCheck,Upload,ChartNoAxesCombined,Users,Compass,Layers,Rocket} from 'lucide-react';
import {technologies} from './content';
import {publicSettings} from './server';
const trajectory=[{title:'Fundamentos',text:'Curiosidade pela tecnologia e atenção à forma como as pessoas usam o digital.',Icon:Compass},{title:'Construção',text:'Design e desenvolvimento conectados à organização do conteúdo.',Icon:Monitor},{title:'Especialização',text:'WordPress, Elementor Pro e Crocoblock na base das soluções.',Icon:Layers},{title:'Integração',text:'Sites, lojas e portais pensados a partir das necessidades do negócio.',Icon:Code2},{title:'Evolução',text:'Aprendizado contínuo e acompanhamento de cada nova etapa.',Icon:Rocket}];
const areas=[{title:'Sites institucionais',text:'Presença digital profissional.',slug:'sites',Icon:Monitor},{title:'Lojas virtuais',text:'Uma jornada de compra clara.',slug:'lojas',Icon:ShoppingCart},{title:'Landing pages',text:'Foco em campanhas e conversão.',slug:'landing',Icon:PanelsTopLeft},{title:'Portfólios',text:'Seu trabalho com contexto.',slug:'portfolios',Icon:FolderOpen},{title:'Portais e sistemas web',text:'Informações e fluxos conectados.',slug:'portais',Icon:Code2},{title:'Manutenção e suporte',text:'Continuidade e evolução do site.',slug:'manutencao',Icon:Wrench},{title:'Consultoria digital',text:'Estratégia para o seu momento.',slug:'consultoria',Icon:MessagesSquare},{title:'Treinamentos e mentoria',text:'Autonomia para sua equipe.',slug:'',Icon:GraduationCap}];
const skills=[['WordPress','Principal'],['Elementor Pro','Principal'],['Crocoblock / JetEngine','Principal'],['WooCommerce','Principal'],['HTML / CSS / JavaScript','Complementar'],['Design UI/UX','Estratégico'],['SEO e performance','Complementar'],['Estratégia digital','Estratégico']];
const steps=[{title:'Descoberta',text:'Entendo seu negócio e suas necessidades.',Icon:Search},{title:'Diagnóstico',text:'Analiso o cenário e as oportunidades.',Icon:Target},{title:'Estratégia',text:'Definimos prioridades e a direção.',Icon:Lightbulb},{title:'Design',text:'Organizo a experiência e a linguagem visual.',Icon:Monitor},{title:'Desenvolvimento',text:'Transformo a proposta em um site funcional.',Icon:Settings},{title:'Conteúdo',text:'Refinamos textos, imagens e organização.',Icon:FileText},{title:'Testes',text:'Reviso navegação, responsividade e funcionamento.',Icon:ShieldCheck},{title:'Publicação',text:'Seu projeto entra no ar com os cuidados finais.',Icon:Upload},{title:'Acompanhamento',text:'Planejamos melhorias e próximos passos.',Icon:ChartNoAxesCombined}];
export default async function AboutAB(){const settings=await publicSettings();return <main id="conteudo" className="ab-about ab-about-v63">
<section className="container ab-about-hero-v63">
  <div className="ab-about-copy-v63">
    <nav className="ab-crumb" aria-label="Localização"><a href="/">Início</a><span aria-hidden="true">›</span><span aria-current="page">Sobre</span></nav>
    <div className="ab-about-kicker-v63"><span aria-hidden="true"/><b>ESTRATÉGIA · DESIGN · TECNOLOGIA</b></div>
    <h1>Crio experiências digitais com <em>direção, identidade e visão de negócio.</em></h1>
    <p className="ab-about-lead-v63">Sou Agnaldo Barreto, web designer. Transformo necessidades de empresas e profissionais em sites, lojas, portais e experiências digitais claras, funcionais e preparadas para evoluir.</p>
    <div className="ab-about-actions-v63"><a className="button" href="/contato">Conversar sobre um projeto <ArrowRight size={18}/></a><a className="button outline" href="/projetos">Explorar meus projetos <ArrowRight size={18}/></a></div>
    <div className="ab-about-proof-v63"><span><Target size={17}/><b>Estratégia</b></span><span><Monitor size={17}/><b>Design</b></span><span><Code2 size={17}/><b>Tecnologia</b></span></div>
  </div>
  <div className="ab-about-visual-v63">
    <img className="ab-about-globe-v63" src="/digital-globe.png" alt="" aria-hidden="true" width="1254" height="1254"/>
    <div className="ab-about-grid-v63" aria-hidden="true"/>
    <div className="ab-about-orbit-v63" aria-hidden="true"/>
    <div className="ab-about-id-v63"><span>AGNALDO BARRETO</span><small>WEB DESIGNER · DIGITAL EXPERIENCE</small></div>
    <NotebookPortrait className="ab-about-person-v63" src="/agnaldo.png" alt="Agnaldo Barreto sorrindo em sua mesa de trabalho" width="1862" height="845" fetchPriority="high"/>
    <div className="ab-about-quote-v63">“Cada projeto começa entendendo <em>o que precisa fazer sentido.</em>”</div>
    <div className="ab-about-stack-v63"><span>WordPress</span><span>Elementor Pro</span><span>Crocoblock</span><span>UX/UI</span></div>
  </div>
</section>

<section className="container ab-values-v63" aria-label="Missão, visão e valores">
  {[{title:'Missão',text:'Transformar necessidades em experiências digitais claras, funcionais e alinhadas ao objetivo de cada negócio.',Icon:Target},{title:'Visão',text:'Construir soluções que unam posicionamento, experiência e tecnologia com consistência e capacidade de evolução.',Icon:Eye},{title:'Valores',text:'Ética, transparência, compromisso, qualidade, colaboração e respeito às pessoas.',Icon:Gem}].map(({title,text,Icon},i)=><article key={title}><span className="ab-value-number-v63">{String(i+1).padStart(2,'0')}</span><span className="ab-value-icon-v63"><Icon size={25}/></span><div><h2>{title}</h2><p>{text}</p></div></article>)}
</section>

<section className="container ab-section-v63 ab-journey-v63" id="trajetoria">
  <div className="ab-section-heading-v63"><div><div className="eyebrow">MINHA TRAJETÓRIA</div><h2>Uma construção feita de <em>curiosidade, prática e evolução.</em></h2></div><p>Minha trajetória no digital foi sendo construída ao conectar tecnologia, organização da informação e a forma como pessoas realmente usam uma experiência online.</p></div>
  <ol className="ab-timeline-v63">{trajectory.map(({title,text,Icon},i)=><li key={title}><div className="ab-timeline-top-v63"><small>{String(i+1).padStart(2,'0')}</small><span className="ab-timeline-icon-v63"><Icon size={22}/></span></div><h3>{title}</h3><p>{text}</p><span className="ab-timeline-rail-v63" aria-hidden="true"/></li>)}</ol>
</section>

<section className="ab-profile-band-v63" id="perfil"><div className="container ab-profile-v63">
  <div className="ab-profile-visual-v63"><div className="ab-profile-glow-v63" aria-hidden="true"/><img className="ab-profile-mark-v63" src="/monograma.png" alt="" aria-hidden="true" width="1254" height="1254" loading="lazy"/><img className="ab-corporate-v63" src="/agnaldo-corporativo.png" alt="Agnaldo Barreto — composição oficial do redesign AB" width="1254" height="1254" loading="lazy"/><div className="ab-profile-caption-v63"><span>AGNALDO BARRETO</span><small>WEB DESIGNER</small></div></div>
  <div className="ab-profile-copy-v63"><div className="eyebrow">PERFIL PROFISSIONAL</div><h2>Ferramentas são importantes.<br/><em>Direção é essencial.</em></h2><p>WordPress, Elementor Pro e Crocoblock fazem parte da minha base de trabalho, mas cada escolha técnica vem depois de entender o contexto, o conteúdo, o público e a operação do projeto.</p><div className="ab-areas-v63">{areas.map(({title,text,slug,Icon})=><a key={title} href={slug?'/servicos#'+slug:'/contato?servico='+encodeURIComponent(title)}><span className="ab-area-icon-v63"><Icon size={20}/></span><span><h3>{title}</h3><p>{text}</p></span><ArrowRight size={14}/></a>)}</div></div>
</div></section>

<section className="container ab-section-v63 ab-capabilities-v63" id="competencias">
  <div className="ab-capability-intro-v63"><div className="eyebrow">COMPETÊNCIAS</div><h2>Conhecimento aplicado à <em>experiência completa.</em></h2><p>Estratégia, interface, conteúdo e tecnologia trabalham juntos. Os rótulos abaixo indicam o papel de cada competência no meu processo, não notas ou percentuais.</p><a className="button outline" href="/projetos">Ver aplicação nos projetos <ArrowRight size={17}/></a></div>
  <div className="ab-skill-grid-v63">{skills.map(([title,level],i)=><article key={title}><div><span>{String(i+1).padStart(2,'0')}</span><small>{level}</small></div><h3>{title}</h3><span className={'ab-skill-role-v63 role-'+level.toLowerCase()} aria-hidden="true"/></article>)}</div>
</section>

<section className="ab-tech-band-v63" id="tecnologias"><div className="container">
  <div className="ab-tech-heading-v63"><div><div className="eyebrow">TECNOLOGIAS QUE UTILIZO</div><h2>Uma stack pensada para <em>resolver, integrar e evoluir.</em></h2></div><p>Ferramentas principais e complementares escolhidas conforme as necessidades de conteúdo, operação, comércio, performance e manutenção.</p></div>
  <ul className="ab-technologies-v63">{technologies.map(([name,category,tier],i)=><li key={name}><span>{String(i+1).padStart(2,'0')}</span><Code2 size={21} aria-hidden="true"/><div><strong>{name}</strong><small>{category}</small></div><em>{tier}</em></li>)}</ul>
</div></section>

<section className="container ab-section-v63 ab-method-v63" id="metodologia">
  <div className="ab-section-heading-v63"><div><div className="eyebrow">MEU PROCESSO</div><h2>Do entendimento inicial<br/><em>à evolução depois da entrega.</em></h2></div><div><p>Um processo claro mantém decisões, expectativas e prioridades conectadas ao objetivo principal do projeto.</p><a className="button outline" href="/contato">Planejar meu projeto <ArrowRight size={17}/></a></div></div>
  <ol className="ab-method-grid-v63">{steps.map(({title,text,Icon},i)=><li key={title}><div className="ab-method-top-v63"><span>{String(i+1).padStart(2,'0')}</span><Icon size={23}/></div><h3>{title}</h3><p>{text}</p></li>)}</ol>
</section>

<section className="container ab-authority-v63" aria-label="Diferenciais profissionais">
  <div className="eyebrow">CONFIANÇA CONSTRUÍDA NO PROCESSO</div>
  <div className="ab-proof-grid-v63">{(settings.metricsConfirmed?[{value:settings.projects,label:'Projetos entregues',Icon:FolderOpen},{value:settings.clients,label:'Clientes atendidos',Icon:Users},{value:settings.satisfaction,label:'Satisfação dos clientes',Icon:ShieldCheck},{value:settings.experience,label:'De experiência',Icon:ChartNoAxesCombined}]:[{value:'Estratégia',label:'Decisões com contexto',Icon:Target},{value:'Proximidade',label:'Comunicação durante o projeto',Icon:Users},{value:'Qualidade',label:'Cuidado em cada entrega',Icon:ShieldCheck},{value:'Evolução',label:'Visão de continuidade',Icon:ChartNoAxesCombined}]).map(({value,label,Icon},i)=><article key={label}><span>{String(i+1).padStart(2,'0')}</span><Icon size={25}/><div><strong>{value||'—'}</strong><p>{label}</p></div></article>)}</div>
</section>

<section className="container ab-about-final-v63"><div><div className="eyebrow">VAMOS CONVERSAR?</div><h2>Seu próximo projeto pode começar com <em>uma conversa bem direcionada.</em></h2><p>Conte o cenário, a necessidade e o momento do seu negócio. A partir daí, organizamos prioridades e avaliamos a solução mais adequada.</p></div><div><a className="button" href="/contato">Falar comigo agora <ArrowRight size={18}/></a><a className="button outline" href="/projetos">Explorar portfólio <ArrowRight size={17}/></a></div><img src="/monograma.png" alt="" aria-hidden="true" loading="lazy"/></section>
</main>}