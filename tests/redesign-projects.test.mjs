import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contentSource = readFileSync(new URL('../app/content.ts', import.meta.url), 'utf8');
const portfolioData = readFileSync(new URL('../app/portfolio-data.ts', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/[...path]/page.tsx', import.meta.url), 'utf8');

test('cases publicados permanecem disponíveis nas três rotas principais', () => {
  for (const slug of ['portal-ab', 'fortmet', 'nathuralys']) {
    assert.equal(contentSource.includes(`slug:'${slug}'`), true);
    assert.equal(page.includes("'/projetos/'+p.slug"), true);
  }
});

test('categorias editoriais continuam mapeadas para filtros do portfólio', () => {
  assert.match(portfolioData, /portal-ab'.*'Portais'/);
  assert.match(portfolioData, /fortmet'.*'Institucionais'/);
  assert.match(portfolioData, /nathuralys'.*'E-commerce'/);
});

test('single projeto preserva navegação para o próximo case', () => {
  assert.match(page, /PRÓXIMO CASE/);
  assert.match(page, /next\.slug/);
});
