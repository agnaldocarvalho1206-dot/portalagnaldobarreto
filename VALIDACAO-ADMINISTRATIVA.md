# Validação administrativa

## Registro histórico — 15/09/2026

Este bloco registra a prévia local realizada naquela data e não representa o mecanismo atual de autenticação. Desde 23/09/2026, o Portal AB usa Supabase Auth e perfis em `public.profiles`; validações novas devem usar contas autorizadas reais de teste no ambiente de homologação. Não é certificação de segurança nem teste da hospedagem publicada.

## Verificações concluídas

- Navegação entre Resumo, Solicitações, Projetos, Mensagens, Relatórios e Configurações.
- Solicitação fictícia recebida pela API e exibida na gestão.
- Projeto criado pela interface e persistido; etapa alterada para Design e progresso para 45%, confirmados na interface.
- Mensagem fictícia gravada; texto contendo uma tag script exibido literalmente.
- Status de solicitação alterado para Aprovado; filtro Recebido passou a mostrar estado vazio.
- Relatório apresentou contagens correspondentes aos registros fictícios.
- Configuração de cidade salva pela interface, confirmada pela API e restaurada ao valor original.
- Seis seções verificadas nas larguras 320, 768 e 1280 px: nenhuma largura excedeu o viewport. Inspeção visual adicional em 390 px.
- API privada sem sessão: 401; alteração de configurações sem sessão: 403; anexo privado sem sessão: 401.
- Após reiniciar a prévia, cabeçalhos nosniff, Referrer-Policy e CSP básica confirmados por HTTP em /, /gestao e /api/settings. HSTS depende de HTTPS e não foi validado no endereço HTTP local.
- Conferência final da gestão sem registros fictícios e sem erros de console capturados.
- TypeScript e compilação do portal concluídos sem erros. Suíte de regressão de segurança aprovada.
- Registros fictícios removidos com filtro por identificadores e verificação de conteúdo; cópia recuperável em work/admin-qa-backup.json. Nenhum cliente real foi usado.

## Correções feitas durante a validação

- Menu móvel passa a apresentar todas as opções em duas colunas.
- Textos longos não forçam largura excessiva; indicadores móveis usam uma coluna.
- Indicadores de progresso recebem nomes acessíveis; opção atual do menu usa aria-current e foco visível.
- Dados vazios deixam de aparecer durante o primeiro carregamento.
- Textos de estado vazio diferenciam administrador e cliente.
- Falha de carregamento de configurações é apresentada e bloqueia a edição, com botão de nova tentativa.
- A API de configurações retorna erro quando o banco falha, em vez de simular configuração vazia.
- Mensagem de sucesso distingue gravação concluída de falha posterior ao atualizar a visualização.
- Limites dos campos e tipos de links acompanham a validação do servidor.

## Limitações

- O isolamento entre dois clientes distintos e administrador precisa ser homologado com contas reais autorizadas no Supabase Auth; a antiga identidade simulada local não é mais o mecanismo de login.
- Não foram simulados indisponibilidade real do banco, expiração do provedor de login ou falhas de rede durante uma gravação; os caminhos correspondentes foram revisados no código.
- Acessibilidade verificada parcialmente, sem certificação WCAG ou ensaio completo com leitor de tela.
- A fidelidade visual foi avaliada pela consistência com o portal existente. Não há modelo administrativo específico fornecido para comparação pixel a pixel.
- Publicação, antivírus de anexos, confirmação de e-mail, backups e políticas de retenção permanecem fora da aprovação local.
