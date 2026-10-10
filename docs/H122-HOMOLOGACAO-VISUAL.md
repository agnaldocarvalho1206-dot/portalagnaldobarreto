# H122 — Homologação visual e funcional (pré-merge)

Status: **PENDENTE DE EXECUÇÃO VISUAL**. O CI verifica testes, build e Docker; não abre o painel autenticado nem comprova aparência em navegador.

## Ambiente e segurança
- [ ] Abrir a branch `h122-ab-premium-ui` em ambiente isolado de homologação, com autenticação válida e dados de teste; não usar a produção como prévia da branch.
- [ ] Confirmar a versão/commit exibido no ambiente antes de iniciar; não confundir a versão em EasyPanel com a branch GitHub.
- [ ] Capturar evidências em 1440px (desktop), 820px (tablet) e 390px (mobile), registrando navegador e data.
- [ ] Não incluir dados pessoais de clientes nas capturas compartilhadas.

## Verificação visual
- [ ] Resumo/Dashboard: hero, imagem oficial `/agnaldo.png`, KPIs, gráficos e ações rápidas sem cortes nem sobreposições.
- [ ] Menu lateral e barra superior: navegação, estado ativo, busca, abertura/fechamento do menu mobile e foco por teclado.
- [ ] Clientes: KPIs, busca, tabela, status, leitura em tela estreita.
- [ ] Projetos: KPIs, busca, tabela, expansão de detalhes e formulário de novo projeto.
- [ ] Leads/CRM: KPIs, filtro de status, pesquisa, expansão e conversão.
- [ ] Propostas: cards, seletor de status e formulário.
- [ ] Tarefas: KPIs, busca, expansão de detalhes e criação.
- [ ] Financeiro: cartões, valores, formulário e seleção de cliente/projeto.
- [ ] Sem rolagem horizontal inesperada na página; se uma tabela exigir rolagem, ela deve ficar restrita ao componente.
- [ ] Estados vazio, carregando, erro e conteúdo longo legíveis.

## Verificação funcional com dados de teste
- [ ] Criar um registro de teste e confirmar sua presença na lista correspondente.
- [ ] Alterar status e confirmar atualização após recarregar.
- [ ] Verificar separação entre usuário administrador e usuário cliente.
- [ ] Confirmar persistência e integridade de dados e contadores após recarga.
- [ ] Confirmar que atalhos e botões respondem com feedback apropriado.
- [ ] Validar navegação por teclado, foco visível e contraste.

## Critério de aprovação
- [ ] Pipeline do **último commit** verde.
- [ ] Evidências desktop/tablet/mobile revisadas.
- [ ] Nenhuma regressão crítica nas funções homologadas.
- [ ] Aprovação explícita para merge; depois, implantação **MANUAL** no EasyPanel.
- [ ] Após deploy manual: health live/ready, login, APIs protegidas, rotas públicas e ações críticas verificados.

**Importante:** marcar cada item somente após execução e evidência. Não considerar este checklist, sozinho, uma homologação realizada.
