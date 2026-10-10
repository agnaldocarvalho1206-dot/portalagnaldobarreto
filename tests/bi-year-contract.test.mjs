import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('H118: gráfico de evolução não mistura anos diferentes', () => {
  const ui=readFileSync(new URL('../app/portal-ui.tsx',import.meta.url),'utf8');
  const start=ui.indexOf('function AdminEvolutionChartV66(');
  const end=ui.indexOf('function AdminServicesV66(',start);
  assert.ok(start>=0&&end>start,'Componente de evolução não encontrado');
  const chart=ui.slice(start,end);
  assert.match(chart,/const year=new Date\(\)\.getFullYear\(\)/);
  assert.equal((chart.match(/d\.getFullYear\(\)===year/g)||[]).length,2,'Receitas e projetos devem respeitar o mesmo ano');
  assert.match(chart,/Evolução de Vendas — \{year\}/);
});
