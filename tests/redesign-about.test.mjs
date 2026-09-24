import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const about = readFileSync(new URL('../app/about-ab.tsx', import.meta.url), 'utf8');

test('página Sobre usa os ativos oficiais do Portal AB', () => {
  for (const asset of ['/agnaldo.png', '/agnaldo-corporativo.png', '/digital-globe.png', '/monograma.png']) {
    assert.equal(about.includes(asset), true);
  }
});

test('métricas da página Sobre continuam condicionadas à confirmação', () => {
  assert.match(about, /settings\.metricsConfirmed\?/);
  assert.match(about, /Decisões com contexto/);
  assert.match(about, /Visão de continuidade/);
});

test('competências não usam porcentagens como alegação de domínio', () => {
  assert.doesNotMatch(about, /\b\d{1,3}%\b/);
});
