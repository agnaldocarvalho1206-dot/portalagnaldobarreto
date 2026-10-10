import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('H119: funil comercial usa contagens consolidadas no banco', () => {
  const api=readFileSync(new URL('../app/api/portal/route.ts',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
  assert.match(api,/SELECT status,COUNT\(\*\)::int AS count FROM leads GROUP BY status/);
  assert.match(api,/metrics,leadStatusCounts,clientPortal/);
  assert.match(ui,/data\.leadStatusCounts\.find\(x=>x\.status===s\)/);
  assert.match(ui,/value=\{n\} max=\{Math\.max\(data\.metrics\.leads\|\|0,1\)\}/);
});
