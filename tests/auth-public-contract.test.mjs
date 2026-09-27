import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('login, logout e recuperação apontam para ações reais e protegidas', () => {
  const loginForm=read('app/login-form.tsx');
  const loginApi=read('app/api/auth/login/route.ts');
  const recoverForm=read('app/recover-password-form.tsx');
  const recoverApi=read('app/api/auth/recover/route.ts');
  const resetForm=read('app/reset-password-form.tsx');
  const logoutApi=read('app/api/auth/logout/route.ts');

  assert.match(loginForm,/fetch\('\/api\/auth\/login'/);
  assert.match(loginForm,/href="\/recuperar"/);
  assert.match(loginApi,/trustedOrigin\(req\)/);
  assert.match(loginApi,/signInWithPassword/);
  assert.match(loginApi,/select\('role,active'\)/);
  assert.match(loginApi,/loginRedirect\(profile\.role, body\.returnTo\)/);

  assert.match(recoverForm,/fetch\('\/api\/auth\/recover'/);
  assert.match(recoverApi,/resetPasswordForEmail/);
  assert.match(recoverApi,/Se o e-mail estiver cadastrado/);
  assert.match(recoverApi,/\/redefinir-senha/);

  assert.match(resetForm,/exchangeCodeForSession/);
  assert.match(resetForm,/updateUser\(\{password\}\)/);
  assert.match(resetForm,/signOut\(\)/);
  assert.match(resetForm,/location\.assign\('\/entrar'\)/);

  assert.match(logoutApi,/trustedOrigin\(req\)/);
  assert.match(logoutApi,/revokeSession\(\)/);
});

test('contato e newsletter executam APIs persistentes com consentimento e proteção de origem', () => {
  const interactions=read('app/interactions.tsx');
  const contact=read('app/api/contact/route.ts');
  const newsletter=read('app/api/newsletter/route.ts');

  assert.match(interactions,/fetch\('\/api\/contact'/);
  assert.match(interactions,/fetch\('\/api\/newsletter'/);
  assert.match(contact,/sameOrigin\(req\)/);
  assert.match(contact,/b\.consent!==true/);
  assert.match(contact,/validateAttachment/);
  assert.match(contact,/INSERT INTO leads/);
  assert.match(newsletter,/sameOrigin\(req\)/);
  assert.match(newsletter,/b\.consent!==true/);
  assert.match(newsletter,/INSERT INTO subscribers/);
});

test('projetos e blog públicos possuem filtros validados e datas editoriais reais', () => {
  const projectsApi=read('app/api/projetos/route.ts');
  const blogApi=read('app/api/blog/route.ts');
  const blogUi=read('app/blog-ab.tsx');

  assert.match(projectsApi,/portfolioCategories\.includes/);
  assert.match(projectsApi,/page<1\|\|page>1000/);
  assert.match(blogApi,/\['Todos',\.\.\.blogTopics\]\.includes/);
  assert.match(blogApi,/page<1\|\|page>1000/);
  assert.match(blogUi,/blogDate\(p\.publishedAt\)/);
  assert.doesNotMatch(blogUi,/>12 set\. 2026</);
});
