# Portal AB — V59 Tecnologias + Projetos em Destaque

## Objetivo
Evoluir a Home após o novo Header/Hero da V58, transformando a faixa de tecnologias e a vitrine de projetos em blocos editoriais coerentes com a nova identidade visual.

## Tecnologias
### Desktop
- Introdução curta à stack.
- Grade 5x2 com dez tecnologias.
- Cada item apresenta símbolo, nome, categoria e classificação Principal/Complementar.
- Ferramentas principais recebem borda de maior contraste.

### Tablet
- Cabeçalho da stack ocupa uma linha própria.
- Cards passam para duas colunas quando necessário.

### Mobile
- Grade de duas colunas.
- Classificação visual é ocultada para preservar espaço.
- Nome e categoria permanecem visíveis.

## Projetos em Destaque
Cases estruturados:
1. Portal Agnaldo Barreto.
2. FORTMET.
3. Nathuralys Essenza.

Cada card contém:
- número do case;
- categoria;
- imagem de referência;
- nome;
- resumo;
- tecnologias principais;
- CTA para case completo.

## Cases internos
O array público `projects` deixa de estar vazio. As rotas individuais passam a ter conteúdo real para:
- `/projetos/portal-ab`
- `/projetos/fortmet`
- `/projetos/nathuralys`

Não foram adicionadas métricas, resultados comerciais ou depoimentos não validados.

## Responsividade
- Desktop: 3 cards.
- Tablet: 2 cards + terceiro em formato horizontal.
- Mobile: 1 card por linha.
- Tecnologias: 5 colunas no desktop e 2 no mobile/tablet compacto.

## Critérios de homologação
1. Tecnologias renderizam sem overflow.
2. Os três projetos abrem suas rotas individuais.
3. Nenhum case exibe métrica não confirmada.
4. Cards mantêm leitura em desktop, tablet e mobile.
5. Build, TypeScript e testes devem passar antes do merge.
