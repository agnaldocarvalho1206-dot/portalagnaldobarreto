import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

async function configFor(environment) {
  const previous = process.env.NODE_ENV;
  const previousSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NODE_ENV = environment;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project-test.supabase.co';
  try {
    const compiled = ts.transpileModule(source + `\nvoid ${JSON.stringify(environment)};`, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    return (await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))).default;
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
    if (previousSupabase === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousSupabase;
  }
}

async function cspFor(environment) {
  const config = await configFor(environment);
  const rules = await config.headers();
  const csp = rules[0].headers.find((header) => header.key === 'Content-Security-Policy');
  assert.ok(csp?.value);
  return csp.value;
}

test('CSP de produção remove unsafe-eval e origens genéricas de conexão', async () => {
  const csp = await cspFor('production');
  assert.doesNotMatch(csp, /'unsafe-eval'/);
  const connect = csp.match(/connect-src ([^;]+)/)?.[1] ?? '';
  assert.match(connect, /https:\/\/project-test\.supabase\.co/);
  assert.match(connect, /wss:\/\/project-test\.supabase\.co/);
  assert.doesNotMatch(connect, /(^|\s)https:(\s|$)/);
  assert.doesNotMatch(connect, /(^|\s)wss:(\s|$)/);
});

test('CSP libera somente os frames externos usados pelo mapa', async () => {
  const csp = await cspFor('production');
  const frame = csp.match(/frame-src ([^;]+)/)?.[1] ?? '';
  assert.match(frame, /https:\/\/maps\.google\.com/);
  assert.match(frame, /https:\/\/www\.google\.com/);
  assert.doesNotMatch(frame, /(^|\s)https:(\s|$)/);
});

test('unsafe-eval permanece disponível somente no desenvolvimento', async () => {
  const csp = await cspFor('development');
  assert.match(csp, /'unsafe-eval'/);
  assert.match(csp, /connect-src [^;]* ws:/);
});


test('CSP acompanha a origem Supabase fornecida no build', async () => {
  const previous=process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://outro-projeto.supabase.co';
  try{
    const compiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const config=(await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))).default;
    const rules=await config.headers();
    const csp=rules[0].headers.find(header=>header.key==='Content-Security-Policy')?.value||'';
    assert.match(csp,/https:\/\/outro-projeto\.supabase\.co/);
    assert.match(csp,/wss:\/\/outro-projeto\.supabase\.co/);
    assert.doesNotMatch(csp,/okhdrmnbfhbdmrrlakdj/);
  } finally {
    if(previous===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL=previous;
  }
});
