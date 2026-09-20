# Publicação funcional do Portal Agnaldo Barreto

Escopo solicitado em 20/09/2026: preservar o visual existente e substituir dependências exclusivas da prévia por uma aplicação Node.js publicada no EasyPanel, com PostgreSQL, anexos privados e autenticação própria por e-mail e senha.

## Arquitetura

- Next.js em Node, compilação de produção, contêiner sem privilégios de root.
- PostgreSQL como fonte de solicitações, projetos, mensagens, configurações, usuários e sessões. Migrações transacionais com bloqueio e checksum.
- Senhas com scrypt e salt aleatório. Cookies HttpOnly, SameSite e Secure em HTTPS. Tokens aleatórios de sessão armazenados somente como hash no banco, com expiração e revogação no logout.
- Primeiro administrador criado pelo terminal, sem endpoint público de bootstrap e sem senha padrão. Contas de clientes criadas pelo operador, sem confiar em cabeçalhos de identidade externos.
- S3/R2 privado para anexos, com autorização pelo proprietário ou administrador em cada download.
- Configurações externas somente por ambiente. Credenciais não integram os arquivos versionados.

## Sequência de execução e critérios

1. Inventariar rotas, recursos, scripts, configuração, dependências e conteúdo público; verificar Git e acesso remoto.
2. Integrar PostgreSQL e migrar consultas específicas de SQLite; integrar armazenamento privado.
3. Implementar login, logout, bootstrap e proteção server-side das páginas e APIs.
4. Eliminar dados demonstrativos públicos, verificar links, formulários e edição de configurações preservando CSS e imagens existentes.
5. Preparar Docker, ambiente de exemplo, documentação de deploy, backups e restauração.
6. Executar tipagem, build e testes de segurança e persistência. Registrar separadamente verificações locais e verificações que dependem de infraestrutura externa.
7. Revisar arquivos e segredos antes de criar o commit e enviar a main, sem sobrescrever histórico remoto.

Não inventar domínio, contatos, resultados de clientes ou credenciais. Nenhuma implantação externa será declarada validada sem execução real nesse ambiente.
