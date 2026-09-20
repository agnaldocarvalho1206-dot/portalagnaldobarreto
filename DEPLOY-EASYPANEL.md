# Deploy no EasyPanel / VPS Hostinger

Use uma VPS com EasyPanel e Docker. cPanel e EasyPanel são painéis diferentes; este projeto usa um **App com Dockerfile** no EasyPanel. Não é hospedagem compartilhada PHP.

## 1. Projeto e PostgreSQL

- Crie um projeto no EasyPanel.
- Adicione um serviço PostgreSQL 17 chamado, por exemplo, banco.
- Configure volume persistente para /var/lib/postgresql/data.
- Não publique a porta 5432 na internet.
- Copie a URL de conexão **interna** exibida pelo EasyPanel para DATABASE_URL.
- Na rede privada sem TLS, use DATABASE_SSL=false; banco remoto exige TLS validado.
- Para menor privilégio, use um usuário de aplicação com SELECT/INSERT/UPDATE/DELETE nas tabelas e um usuário de migração com DDL. MIGRATION_DATABASE_URL pertence ao job de migração, não precisa permanecer no App.

## 2. Bucket privado

Crie um bucket R2 ou S3 privado. Desative domínio público, listagem e acesso público. Gere credencial limitada a leitura/gravação/exclusão de objetos e verificação do bucket. Configure as cinco variáveis S3 do .env.example. Não compartilhe chaves pelo chat ou repositório.

O portal armazena documentos em contact/ com identificador aleatório. O nome original não vira caminho de arquivo. O download passa pela API autenticada. O health check verifica disponibilidade do bucket; a política de privacidade do bucket deve ser verificada no provedor.

## 3. App e build

- Adicione um App com origem GitHub: agnaldocarvalho1206-dot/portalagnaldobarreto, branch main.
- Selecione build por Dockerfile, caminho Dockerfile.
- Configure porta interna 3000 e protocolo HTTP interno.
- Cadastre o ambiente usando .env.example como guia, com valores reais apenas no editor do EasyPanel.
- O Dockerfile executa npm ci e npm run build no Linux. Nenhuma dependência deve ser instalada manualmente em um contêiner em execução.
- Defina pelo menos 1 GB de RAM para o App e memória adicional no build. Ajuste conforme a utilização.
- O processo roda como usuário node, sem privilégios de root.

## 4. Migrações seguras

Antes de atualizar um banco existente:

1. Gere backup consistente e confirme que pode restaurá-lo.
2. Faça deploy do build, mas mantenha tráfego desligado até a migração e a validação.
3. Em terminal/job da mesma imagem com MIGRATION_DATABASE_URL configurada, execute:

```sh
node scripts/migrate-postgres.mjs
```

4. Confira a saída e o status de execução. O script usa transação, advisory lock e checksum. Falhas fazem rollback; não edite migrações já aplicadas.
5. Execute novamente: deve apenas conferir as migrações, sem duplicar dados.
6. Não use drop, reset, db push destrutivo ou recriação automática do banco.

O health check ready permanece 503 antes das migrações ou quando banco/bucket não respondem. Use um job/terminal disponível mesmo se o App ainda estiver não saudável. Nunca execute migrações automaticamente em cada réplica.

## 5. Primeiro administrador

Abra terminal interativo do contêiner:

```sh
node scripts/manage-user.mjs create-admin
```

Digite e-mail, nome e uma senha forte. A senha não aparece na tela. Faça login em /entrar e abra /gestao. Preencha os contatos em Configurações. Não há conta padrão. Redefinição pelo operador usa reset-password e encerra as sessões anteriores.

## 6. Domínio e HTTPS

- Aponte o registro A do domínio ao IP da VPS. Configure AAAA somente se IPv6 estiver funcionando.
- Adicione o domínio ao App no EasyPanel e habilite certificado HTTPS.
- Defina APP_URL para a origem exata, por exemplo https://portal.example.com, usando seu domínio real.
- Redirecione HTTP para HTTPS no proxy. Escolha uma origem canônica para www/sem www.
- Cookies de produção exigem HTTPS.
- Mantenha a porta Node acessível somente pelo proxy. TRUST_PROXY=true só quando x-real-ip for removido e sobrescrito pelo proxy, não repassado do visitante.
- Limite uploads no proxy a 11 MB e configure limites de conexão e tempo.

## 7. Health checks e logs

- /api/health/live: processo responde.
- /api/health/ready: migrações, banco e bucket disponíveis.
- Configure readiness na porta 3000 com intervalo de 30 s, timeout de 10 s e três falhas.
- Confira logs do build, App e PostgreSQL. Logs de falha da aplicação são resumidos e não incluem mensagens, senhas ou credenciais.
- Ative rotação e retenção de logs no host; monitore RAM, CPU, disco e erros 5xx.
- Indisponibilidade externa não deve ser interpretada como sucesso de envio de formulário.

## 8. Persistência e backups

- PostgreSQL deve usar volume persistente; anexos permanecem no bucket externo.
- O filesystem do App é descartável. Não armazene uploads em public ou dentro do contêiner.
- Agende backup diário do banco em formato custom, por exemplo com pg_dump -Fc, em job com credenciais via ambiente/arquivo protegido.
- Guarde cópias fora da VPS, criptografadas, com retenção adequada. Exemplo inicial: sete diárias e quatro semanais.
- Ative versionamento ou cópia para outro bucket conforme o provedor permitir. Sincronização que replica exclusões não basta como backup.
- Guarde separadamente configuração do EasyPanel, DNS e credenciais em cofre seguro.

## 9. Restauração

1. Crie um PostgreSQL vazio de mesma versão principal em ambiente isolado.
2. Restaure usando pg_restore --exit-on-error --no-owner --no-acl; configure permissões do usuário da aplicação.
3. Restaure os objetos do bucket preservando chaves e metadados, especialmente leadid e filename.
4. Aponte uma instância isolada do portal para esses recursos.
5. Confira health check, login, contagem de solicitações/projetos/mensagens e download de anexos.
6. Revogue sessões restauradas com DELETE FROM sessions em janela controlada, para evitar reativar sessões antigas.
7. Só então faça a troca do tráfego. Mantenha o ambiente anterior para rollback.

Teste restauração periodicamente. Não foi executado backup/restore na VPS nesta validação local.

## 10. Checklist após publicar

- [ ] Build Linux concluído sem erro e contêiner saudável.
- [ ] Domínio e HTTPS funcionando; nenhuma porta de banco pública.
- [ ] /gestao e /portal anônimos redirecionam ao login.
- [ ] Cabeçalhos de identidade forjados não dão acesso.
- [ ] Login válido funciona; senha incorreta falha; logout invalida a sessão.
- [ ] Cliente não acessa gestão, projetos ou anexos de outro cliente.
- [ ] Orçamento grava protocolo e aparece no painel.
- [ ] Alterações de status/progresso e mensagens persistem após reiniciar o App.
- [ ] Anexo sobe, baixa para usuário autorizado e é negado para terceiros.
- [ ] Configurações públicas salvas aparecem no site.
- [ ] Cadastro de conteúdos aparece no CSV administrativo.
- [ ] Navegação e formulários funcionam no celular.
- [ ] Backup automático está agendado e uma restauração foi conferida.
- [ ] Contatos, domínio e conteúdo comercial foram preenchidos pelo responsável.

Referências: [App EasyPanel](https://easypanel.io/docs/services/app), [PostgreSQL EasyPanel](https://easypanel.io/docs/services/postgres), [Next.js self hosting](https://nextjs.org/docs/app/guides/self-hosting).
