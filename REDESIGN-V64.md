# Portal AB — V64 Projetos + Single Projeto

## Objetivo
Levar o novo sistema visual do Portal AB para a página geral de Projetos e para a apresentação individual de cada case.

## Página Projetos
- Hero editorial com posicionamento claro de portfólio.
- Filtros e busca preservados.
- Cards de projeto com hierarquia mais forte.
- Estados de carregamento/filtro sem alteração funcional.
- Responsividade Desktop, Tablet e Mobile.

## Single Projeto
Estrutura:
1. Breadcrumb + identificação do case.
2. Hero do projeto.
3. Metadados de marca, categoria e tecnologias.
4. Desafio e objetivo.
5. Estratégia e direção visual.
6. Escopo.
7. Responsividade/entrega.
8. Navegação para o próximo projeto.
9. CTA para contato.

## Regras
- Não inventar resultados, métricas ou depoimentos.
- Usar somente dados existentes no array `projects`.
- Manter rotas e filtros atuais.
- Preservar acessibilidade e navegação por teclado.

## Critérios de homologação
1. Filtros da página Projetos continuam funcionando.
2. Os três cases ativos abrem sem erro.
3. Próximo projeto continua funcionando.
4. Sem overflow em Desktop, Tablet ou Mobile.
5. Testes, TypeScript e Build devem passar antes do merge.
