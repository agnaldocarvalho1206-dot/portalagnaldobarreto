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
5. Configure o Supabase Auth e confirme que existe um perfil ativo com papel `admin` em `public.profiles`. A criação e a recuperação de credenciais são feitas pelo Supabase, não pelo PostgreSQL da aplicação.
6. Para desenvolvimento: defina `APP_URL=http://127.0.0.1:5173` no ambiente e execute `npm run dev`. O Next carrega `.env`; não use credenciais de produção na prévia.
7. Para produção: configure `APP_URL=https://seu-dominio`, execute `npm run build` e `npm start` com as variáveis exportadas pelo serviço.

O servidor standalone contém os assets após o build. A publicação Docker faz isso automaticamente. O script de migração do PostgreSQL carrega `.env` quando ele existe. Em produção, prefira as variáveis do EasyPanel. O arquivo histórico `drizzle/postgres/0001_auth.sql` não define mais o mecanismo de login ativo; autenticação e perfis de acesso são responsabilidade do Supabase Auth.

## Primeiro acesso e contas

- Login: **/entrar**
- Administração: **/gestao**
- Área do cliente: **/portal**
- A autenticação é feita pelo **Supabase Auth**.
- Os dados de autorização ficam em `public.profiles`, com os papéis `admin`, `staff` e `client` e o campo `active`.
- Em **Gestão → Usuários**, administradores podem visualizar perfis existentes, alterar papéis e ativar/desativar contas. O sistema bloqueia a remoção do próprio papel de administrador e a auto-desativação para reduzir risco de bloqueio acidental.
- A listagem e as alterações respeitam as políticas RLS do Supabase; nenhuma chave secreta é enviada ao navegador.
- Não existe senha padrão, cadastro público de administrador nem botão de acesso fictício. Provisionamento e recuperação de credenciais permanecem sob o Supabase Auth.

## Recursos conectados

- Contato com protocolo, consentimento, validação, limite de tentativas e anexo privado.
- Gestão de solicitações, status, projetos, etapas, progresso e mensagens.
- Configurações públicas de contato salvas no banco.
- Cadastro de interessados em conteúdos e exportação CSV restrita à administração, na aba Relatórios. O cadastro não dispara e-mails automaticamente; campanhas dependem do serviço de e-mail contratado.
- Blog editorial, navegação e filtros.
- Download de anexos autorizado por usuário ou administrador.
- Health checks: `/api/health/live` verifica o processo; `/api/health/ready` exige PostgreSQL, bucket privado e Supabase Auth disponíveis.

Cases e números demonstrativos foram retirados da publicação. Projetos públicos reais são cadastrados em `app/content.ts`; não devem ser confundidos com os projetos privados de clientes no painel. Textos editoriais e páginas públicas continuam mantidos nos arquivos existentes. Contatos comerciais são definidos em Gestão → Configurações. Nenhum domínio, contato ou resultado comercial foi inventado para completar a publicação.

## Variáveis

| Variável | Uso |
|---|---|
| APP_URL | Origem pública HTTPS, sem caminho |
| NEXT_PUBLIC_SUPABASE_URL | URL pública do projeto Supabase |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Chave publicável do Supabase usada com RLS |
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

Gere `RATE_LIMIT_HMAC_SECRET` localmente usando o comando indicado no exemplo de ambiente. Senhas com caracteres especiais na URL do PostgreSQL precisam ser codificadas para URL. Antes do deploy, execute `npm run preflight`; ele também valida a URL HTTPS e a chave publicável `sb_publishable_...` do Supabase.

## Testes

```sh
npm test
npm run typecheck
npm run build
npm audit --omit=dev
```

A suíte padrão usa apenas recursos isolados de teste e não deve acessar dados reais. O CI executa testes, TypeScript e Build em cada pull request. Consulte `VALIDACAO-ADMINISTRATIVA.md` para o histórico e os limites das validações.

## Publicação, backups e restauração

Siga **[DEPLOY-EASYPANEL.md](DEPLOY-EASYPANEL.md)**. O Dockerfile é a configuração de publicação. Não use Wrangler, Vinext, arquivos de cache ou a pasta `work` no servidor. Dados ou arquivos de implantações antigas não são importados automaticamente: se houver conteúdo real legado, faça uma migração conferida antes de trocar o serviço.

Não coloque o bucket em modo público. Os arquivos enviados são documentos privados; validação de formato não substitui inspeção antimalware.
