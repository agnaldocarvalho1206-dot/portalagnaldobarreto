import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const docker = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/validate.yml', import.meta.url), 'utf8');

test('build usa instalação reprodutível pelo lockfile', () => {
  assert.match(docker, /RUN npm ci --no-audit --no-fund/);
  assert.match(workflow, /run: npm ci --no-audit --no-fund/);
  assert.doesNotMatch(docker, /RUN npm install /);
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
  assert.match(docker, /npm_config_maxsockets=2/);
  assert.match(docker, /npm_config_progress=false/);
  assert.match(docker, /npm ci --no-audit --no-fund --prefer-offline/);
});
