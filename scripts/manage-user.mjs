console.error([
  'Este utilitário foi desativado porque o Portal AB usa Supabase Auth.',
  'Crie, recupere ou administre credenciais pelo Supabase Auth.',
  'Papéis e ativação são gerenciados em public.profiles e pela Central Gestão → Usuários.',
  'Nenhuma conta de acesso deve ser criada nas tabelas PostgreSQL históricas users/sessions.'
].join('\n'));
process.exitCode = 1;
