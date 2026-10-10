import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('H121: layout responsivo do BI preserva métricas financeiras',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
 assert.match(css,/\.portal-main \.bi-kpis\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:1100px\)\{\.portal-main \.bi-kpis\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:560px\)\{\.portal-main \.bi-kpis\{grid-template-columns:minmax\(0,1fr\)/);
 assert.match(ui,/className="bi-overdue"/);
 assert.match(ui,/data\.metrics\.receivableCents/);
 assert.match(ui,/data\.metrics\.overdueReceivableCents/);
});
