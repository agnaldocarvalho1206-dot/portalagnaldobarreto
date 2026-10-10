import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('H120: total a receber inclui pendentes e vencidos; atraso é separado',()=>{
 const api=readFileSync(new URL('../app/api/portal/route.ts',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
 assert.match(api,/receivableCents:Number\(\(await db\.prepare\("SELECT COALESCE\(SUM\(amount_cents\),0\) AS n FROM financial_entries WHERE entry_type='Receita' AND status IN \('Pendente','Vencido'\)"/);
 assert.match(api,/overdueReceivableCents:Number\(\(await db\.prepare\("SELECT COALESCE\(SUM\(amount_cents\),0\) AS n FROM financial_entries WHERE entry_type='Receita' AND status='Vencido'"/);
 assert.match(ui,/<small>Total a receber<\/small>/);
 assert.match(ui,/data\.metrics\.overdueReceivableCents/);
});
