# Portal AB — V58 Redesign Header + Hero

## Objetivo
Iniciar o redesign visual oficial do Portal Agnaldo Barreto com uma linguagem premium, tecnológica e autoral, mantendo a identidade azul, preto, branco e neon e usando os ativos oficiais já existentes no projeto.

## Header

### Desktop
- Header sticky com fundo escuro translúcido, blur e linha neon discreta.
- Monograma AB dentro de uma moldura própria, separado do wordmark.
- Assinatura: **AGNALDO BARRETO** + **WEB DESIGNER · DIGITAL EXPERIENCE**.
- Navegação central em cápsula translúcida com estado ativo visível.
- Acesso do cliente separado da navegação principal.
- CTA principal: **Iniciar projeto**.

### Tablet
- Redução progressiva do texto secundário e espaçamentos.
- Mantém marca, navegação e CTA enquanto houver largura suficiente.
- Abaixo do limite de navegação, troca para menu móvel sem comprimir links.

### Mobile
- Header de 76 px.
- Marca preservada.
- Menu hambúrguer com área de toque de 44 px.
- Menu aberto em painel flutuante com links em coluna.
- Área do cliente volta a aparecer dentro do menu.

## Hero

### Desktop
- Layout em duas colunas.
- Coluna esquerda:
  - selo de especialização;
  - headline editorial, sem caixa alta forçada;
  - proposta de valor;
  - CTA de portfólio e CTA de contato;
  - três provas de valor: Estratégia, Design e Performance.
- Coluna direita:
  - foto oficial de Agnaldo;
  - globo digital oficial;
  - grid técnico;
  - halo neon;
  - identificação profissional;
  - barra de capacidades;
  - assinatura conceitual sobre design e resultados.

### Tablet
- Hero passa para uma coluna quando o espaço lateral deixa de favorecer a composição.
- Texto permanece acima da imagem.
- Visual mantém globo, persona, identificação e tecnologias.
- Elementos decorativos secundários são reduzidos antes de comprometer a leitura.

### Mobile
- Headline com escala fluida.
- CTAs ocupam largura total.
- Provas de valor permanecem em três blocos compactos.
- Visual reduz para aproximadamente 405 px.
- Elementos decorativos não essenciais são removidos.
- Barra técnica permanece acessível e legível.

## Identidade
- Fundo principal: azul-marinho quase preto.
- Destaques: azul elétrico e ciano neon.
- Cards: vidro escuro e bordas translúcidas.
- Tipografia: hierarquia forte, editorial e técnica.
- Animações e hover respeitam `prefers-reduced-motion`.

## Ativos oficiais utilizados
- `/monograma.png`
- `/agnaldo.png`
- `/digital-globe.png`

## O que não muda na V58
- Banco de dados.
- Supabase Auth.
- APIs.
- Portal do cliente.
- Gestão.
- Conteúdo das demais seções da Home.
- Rotas existentes.

## Critérios de homologação
1. Header funcional em Desktop, Tablet e Mobile.
2. Menu móvel abre e fecha sem impedir navegação.
3. Links ativos continuam indicando a rota atual.
4. Hero não causa overflow horizontal.
5. Imagem oficial permanece íntegra.
6. CTAs continuam apontando para Projetos e Contato.
7. Build Next.js, TypeScript e testes automatizados devem passar antes do merge.
