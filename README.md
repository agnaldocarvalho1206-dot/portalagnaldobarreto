# Portal Agnaldo Barreto

Portal público e área de gestão em Next.js, Node.js, PostgreSQL e armazenamento S3/R2 privado. O visual existente foi preservado. A aplicação não utiliza login de demonstração nem identidade recebida em cabeçalhos do ChatGPT.

## Requisitos

- Node.js 24 LTS e npm.
- PostgreSQL 17 (serviço privado no EasyPanel ou Docker).
- Bucket S3/R2 **privado** e credencial limitada a esse bucket.
- Domínio com HTTPS para produção.

## Instalação

1. Clone este repositório e entre na pasta.
2. Execute `npm ci`.
3. Copie `.env.example` para `.env` e preencha os valores. Nunca envie `.env` ao Git.
4. Execute `npm run db:migrate`. Faça backup antes de migrar um banco existente.
5. Execute `npm run admin:create`. O terminal solicita nome, e-mail e senha, com a senha oculta.
6. Para desenvolvimento: defina `APP_URL=http://127.0.0.1:5173` no ambiente e execute `npm run dev`. O Next carrega `.env`; não use credenciais de produção na prévia.
7. Para produção: configure `APP_URL=https://seu-dominio`, execute `npm run build` e `npm start` com as variáveis exportadas pelo serviço.

O servidor standalone contém os assets após o build. A publicação Docker faz isso automaticamente. Os scripts de migração e gestão de usuários carregam `.env` quando ele existe. Em produção, prefira as variáveis do EasyPanel.

## Primeiro acesso e contas

- Login: **/entrar**
- Administração: **/gestao**
- Área do cliente: **/portal**
- Primeiro administrador: `npm run admin:create`.
- Criar cliente: `npm run user:create`.
- Redefinir senha e revogar todas as sessões da conta: `npm run user:password`.

No contêiner do EasyPanel, abra um terminal interativo e use:

```sh
node scripts/manage-user.mjs create-admin
```

Para clientes, use `create-client`; para redefinição, `reset-password`. Não passe senhas como argumentos e não as coloque em arquivos versionados. Não existe senha padrão, cadastro público de administrador nem botão de acesso fictício. O operador deve verificar a identidade do cliente antes de criar/redefinir a conta. Ao criar uma conta, solicitações anônimas anteriores com aquele e-mail são vinculadas pelo operador à conta.

As senhas usam scrypt com salt aleatório; sessões de oito horas usam tokens aleatórios armazenados somente como hash no PostgreSQL. Logout revoga a sessão no servidor. Usuários comuns não acessam funções administrativas nem registros de outros clientes.

## Recursos conectados

- Contato com protocolo, consentimento, validação, limite de tentativas e anexo privado.
- Gestão de solicitações, status, projetos, etapas, progresso e mensagens.
- Configurações públicas de contato salvas no banco.
- Cadastro de interessados em conteúdos e exportação CSV restrita à administração, na aba Relatórios. O cadastro não dispara e-mails automaticamente; campanhas dependem do serviço de e-mail contratado.
- Blog editorial, navegação e filtros.
- Download de anexos autorizado por usuário ou administrador.
- Health checks: `/api/health/live` e `/api/health/ready`.

Cases e números demonstrativos foram retirados da publicação. Projetos públicos reais são cadastrados em `app/content.ts`; não devem ser confundidos com os projetos privados de clientes no painel. Textos editoriais e páginas públicas continuam mantidos nos arquivos existentes. Contatos comerciais são definidos em Gestão → Configurações. Nenhum domínio, contato ou resultado comercial foi inventado para completar a publicação.

## Variáveis

| Variável | Uso |
|---|---|
| APP_URL | Origem pública HTTPS, sem caminho |
| DATABASE_URL | Conexão do usuário da aplicação ao PostgreSQL |
| DATABASE_SSL | false na rede privada EasyPanel; true com TLS validado em banco remoto |
| DATABASE_POOL_MAX | De 1 a 50; padrão 10 |
| MIGRATION_DATABASE_URL | Conexão com permissão DDL, somente no job/terminal de migração |
| RATE_LIMIT_HMAC_SECRET | Segredo aleatório com pelo menos 32 caracteres |
| S3_ENDPOINT, S3_REGION, S3_BUCKET | Bucket privado |
| S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY | Credenciais restritas ao bucket |
| S3_FORCE_PATH_STYLE | Conforme o provedor S3; normalmente false no R2 |
| TRUST_PROXY | false por padrão; true somente com x-real-ip sobrescrito pelo proxy |
| NODE_ENV, HOSTNAME, PORT | production, 0.0.0.0 e 3000 no contêiner |
| POSTGRES_PASSWORD | Somente ao usar o compose fornecido |
| NEXT_TELEMETRY_DISABLED | 1 |

Gere `RATE_LIMIT_HMAC_SECRET` localmente usando o comando indicado no exemplo de ambiente. Senhas com caracteres especiais na URL do PostgreSQL precisam ser codificadas para URL.

## Testes

```sh
npm test
npm run typecheck
npm run build
npm audit --omit=dev
```

A integração HTTP usa serviços isolados de teste, não dados reais. Consulte `VALIDACAO-ADMINISTRATIVA.md` para execução e limites da validação.

## Publicação, backups e restauração

Siga **[DEPLOY-EASYPANEL.md](DEPLOY-EASYPANEL.md)**. O Dockerfile é a configuração de publicação. Não use Wrangler, Vinext, arquivos de cache ou a pasta `work` no servidor. O banco D1 antigo e arquivos R2 existentes não são importados automaticamente: se houver dados reais antigos, faça uma migração de dados conferida antes de trocar o serviço.

Não coloque o bucket em modo público. Os arquivos enviados são documentos privados; validação de formato não substitui inspeção antimalware.
