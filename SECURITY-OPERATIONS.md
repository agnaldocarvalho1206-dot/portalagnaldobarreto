# Segurança do portal

## Atualização de 23/09/2026

- Autenticação e sessões do Portal AB usam Supabase Auth; `public.profiles` concentra papel e situação da conta.
- Funções auxiliares privilegiadas de RLS foram movidas para schema privado; os wrappers públicos são `SECURITY INVOKER`.
- O readiness de produção verifica PostgreSQL, armazenamento e disponibilidade do Supabase Auth.
- O Proxy do Next.js renova tokens/cookies do Supabase Auth com `getClaims()` antes de Server Components protegidos; isso evita expiração silenciosa de sessão durante navegação SSR.
- O retorno após login aceita somente `/portal` ou `/gestao`; clientes não podem usar `return_to` para entrar na gestão e URLs externas são descartadas.
- Cabeçalhos de segurança e CSP ficam centralizados em `next.config.ts`; o Proxy não mantém uma política paralela que possa sobrescrever a configuração completa.
- O preflight exige URL HTTPS e chave `sb_publishable_...` do Supabase, além das dependências já existentes.
- A autenticação local histórica em `users/sessions` não deve ser usada para provisionar ou revogar acesso.

## Alterações de 14/09/2026

- APIs de escrita exigem Origin igual ao endereço da requisição e rejeitam Sec-Fetch-Site cross-site.
- JSON limitado a 32 KiB; contato JSON a 20 KB e multipart a 10 MiB mais 64 KiB.
- Contadores de rate limit ficam no PostgreSQL da aplicação e não fazem parte das configurações públicas. Contato: 5 tentativas/hora por IP; newsletter: 5/minuto por IP; portal e configurações: 30/minuto; mensagens: 10/minuto por usuário. Tentativas inválidas também contam.
- Expiração por janela iniciada na primeira tentativa. Limpeza de até 50 contadores vencidos há mais de um dia por tentativa aceita.
- Os identificadores de IP usam hash, que continua sendo dado pseudonimizado, não anônimo. A borda deve substituir CF-Connecting-IP, e o servidor de desenvolvimento deve continuar restrito ao loopback.
- Erros inesperados registram somente operação, evento e UUID, sem conteúdo, identidade ou erro bruto.
- Campos de texto com tipo incorreto ou tamanho excessivo são rejeitados.
- Anexos têm verificações estruturais adicionais. PNG inclui CRC e dimensões; JPEG exige estrutura básica, dimensões e término; PDF exige término e rejeita nomes de ações ativas comuns. Essas verificações NÃO garantem ausência de malware nem decodificação completa.
- Colisão de identificador de contato retorna 409, sem afirmar que uma nova mensagem foi salva.
- Cabeçalhos básicos preservam a incorporação da prévia. CSP completa com nonce depende da integração do framework; a política atual não restringe scripts.

## Verificação local

Executar `node tests/security.test.mjs` e `node node_modules/typescript/bin/tsc --noEmit` usando o Node do projeto. A suíte usa banco em memória, sem registros de clientes. Validar também respostas HTTP 400, 401, 403, 413, 415 e 429 na prévia.

## Pendências antes de receber dados reais

1. Testar duas contas reais de cliente e um administrador autorizados no Supabase Auth; verificar isolamento por RLS, redirecionamentos e ausência de confiança em cabeçalhos de identidade forjados.
2. Configurar análise antimalware e quarentena de anexos. Enquanto isso, documentos devem ser tratados como não confiáveis, inclusive depois das verificações locais. Não há antivírus implementado.
3. Escolher serviço de e-mail para confirmação de inscrição e cancelamento por token. Não disparar campanhas para a base atual sem verificar consentimento e titularidade.
4. Definir controlador, canal de atendimento, finalidades, bases legais e retenção. Não executar exclusão automática sem esses prazos e regras.
5. Confirmar backup do PostgreSQL e do bucket S3/R2 privado. Definir RPO (perda máxima tolerada) e RTO (tempo máximo de recuperação); restaurar ambos em homologação e conferir relações entre arquivos e solicitações. Registrar data, responsável e resultado.
6. Configurar alertas de falhas, volume de requisições e custo. Em incidente: conter acesso, preservar registros sem ampliar exposição, revogar credenciais afetadas e avaliar as comunicações legais aplicáveis.
7. Auditar dependências e histórico de segredos antes de publicação; revisar no Supabase Auth políticas de senha, recuperação, MFA quando aplicável e proteção contra senhas vazadas. Valores locais não são transferidos automaticamente.

## Limitações restantes no negócio

Pagamentos e pedidos comerciais não foram adicionados. Não há trilha completa de auditoria administrativa, controle de edições concorrentes ou garantia de unicidade de projetos por solicitação. Essas mudanças exigem definir regras de negócio e migrações compatíveis com os dados existentes.
