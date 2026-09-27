import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const docker = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/validate.yml', import.meta.url), 'utf8');

test('build usa lockfile para runtime e ferramentas de build fixadas', () => {
  assert.match(docker, /RUN npm ci --omit=dev --no-audit --no-fund --prefer-offline/);
  assert.match(workflow, /run: npm ci --no-audit --no-fund/);
  assert.match(docker, /mkdir -p \/app\/\.build-tools && cd \/app\/\.build-tools/);
  assert.match(docker, /npm install --no-save --package-lock=false/);
  assert.match(docker, /ln -s \/app\/\.build-tools\/node_modules\/@tailwindcss\/postcss/);

  for (const pkg of [
    '@tailwindcss/postcss@4.2.1',
    '@types/node@22.19.19',
    '@types/pg@8.23.1',
    '@types/react@19.2.14',
    '@types/react-dom@19.2.3',
    'tailwindcss@4.2.1',
    'tw-animate-css@1.4.0',
    'typescript@5.9.3',
  ]) assert.ok(docker.includes(pkg), 'ferramenta de build fixada: '+pkg);

  for (const heavy of [
    '@electric-sql/pglite',
    '@electric-sql/pglite-socket',
    'drizzle-kit',
    'eslint-config-next',
    's3rver',
  ]) assert.ok(!docker.includes(' '+heavy+'@'), 'dependência pesada não deve ser instalada no build: '+heavy);

  assert.doesNotMatch(workflow, /run: npm install /);
});

test('Docker declara somente configuração pública do Supabase no build', () => {
  assert.match(docker, /ARG NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(docker, /ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(docker, /test -n "\$NEXT_PUBLIC_SUPABASE_URL"/);
  assert.match(docker, /test -n "\$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"/);
  for (const secret of ['DATABASE_URL', 'S3_SECRET_ACCESS_KEY', 'RATE_LIMIT_HMAC_SECRET', 'SUPABASE_SECRET_KEY', 'SERVICE_ROLE']) {
    assert.doesNotMatch(docker, new RegExp('ARG\\s+' + secret));
  }
});

test('Docker limita memoria e concorrencia durante instalacao/build no EasyPanel', () => {
  assert.match(docker, /NODE_OPTIONS=--max-old-space-size=384/);
  assert.match(docker, /npm_config_maxsockets=1/);
  assert.match(docker, /npm_config_progress=false/);
  assert.match(docker, /npm ci --omit=dev --no-audit --no-fund --prefer-offline/);
});
