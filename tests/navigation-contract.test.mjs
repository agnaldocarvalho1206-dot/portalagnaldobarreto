import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const publicFiles = [
  'app/shell.tsx',
  'app/page.tsx',
  'app/[...path]/page.tsx',
  'app/about-ab.tsx',
  'app/services-ab.tsx',
  'app/projects-ab.tsx',
  'app/contact-ab.tsx',
  'app/blog-ab.tsx',
  'app/interactions.tsx',
  'app/portfolio-explorer.tsx',
];

const sources = Object.fromEntries(publicFiles.map(path => [path, read(path)]));
const publicRouteRoots = new Set([
  '',
  'sobre',
  'projetos',
  'servicos',
  'blog',
  'contato',
  'depoimentos',
  'privacidade',
  'entrar',
  'recuperar',
  'redefinir-senha',
  'portal',
  'gestao',
]);

function literalHrefs(source) {
  return [...source.matchAll(/href\s*=\s*["']([^"']*)["']/g)].map(match => match[1]);
}

test('links internos literais apontam apenas para rotas públicas conhecidas', () => {
  for (const [path, source] of Object.entries(sources)) {
    for (const href of literalHrefs(source)) {
      assert.notEqual(href, '', path + ' contém href vazio');
      assert.notEqual(href, '#', path + ' contém href placeholder');
      assert.ok(!href.toLowerCase().startsWith('javascript:'), path + ' contém javascript: em link');

      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const pathname = href.split(/[?#]/, 1)[0];
      const root = pathname.split('/').filter(Boolean)[0] ?? '';
      assert.ok(publicRouteRoots.has(root), path + ' aponta para rota interna não homologada: ' + href);
    }
  }
});

test('âncoras públicas usadas por CTAs existem nas páginas de destino', () => {
  const checks = [
    ['app/portfolio-explorer.tsx', 'portfolio'],
    ['app/services-ab.tsx', 'processo'],
    ['app/services-ab.tsx', 'solucoes'],
    ['app/contact-ab.tsx', 'orcamento'],
    ['app/contact-ab.tsx', 'localizacao'],
    ['app/about-ab.tsx', 'tecnologias'],
    ['app/about-ab.tsx', 'metodologia'],
  ];
  for (const [path, id] of checks) {
    assert.match(sources[path], new RegExp('id=["\\\']' + id + '["\\\']'), path + ' precisa expor #' + id);
  }
});

test('ações administrativas disparadas pela interface possuem tratamento correspondente na API', () => {
  const ui = read('app/portal-ui.tsx');
  const api = read('app/api/portal/route.ts');

  const uiActions = new Set([
    ...[...ui.matchAll(/action\(\{action:['"]([^'"]+)['"]/g)].map(m => m[1]),
    ...[...ui.matchAll(/action:\s*['"]([^'"]+)['"]/g)].map(m => m[1]),
  ]);

  assert.ok(uiActions.size > 0, 'Nenhuma ação administrativa foi detectada na interface.');

  for (const action of uiActions) {
    assert.ok(
      api.includes("b.action==='" + action + "'") ||
      api.includes('b.action==="' + action + '"') ||
      api.includes("'" + action + "'") ||
      api.includes('"' + action + '"'),
      'A interface dispara a ação sem contrato aparente na API: ' + action,
    );
  }
});

test('dashboard não usa percentuais demonstrativos quando não existem leads reais', () => {
  const ui = read('app/portal-ui.tsx');
  assert.doesNotMatch(ui, /Sites Institucionais',value:32/);
  assert.doesNotMatch(ui, /Lojas Virtuais',value:24/);
  assert.match(ui, /Nenhum dado real de serviços disponível ainda/);
});


test('atalhos administrativos executam a ação prometida', () => {
  const ui=read('app/portal-ui.tsx');
  assert.match(ui,/setTab\('Projetos'\);setCreate\(true\)/);
  assert.match(ui,/defaultOpen=\{selected===p\.id\}/);
  assert.doesNotMatch(ui,/>Novo Cliente<\/b><small>Cadastrar cliente<\/small>/);
  assert.match(ui,/>Clientes<\/b><small>Gerenciar clientes<\/small>/);
});
