import { Pool, types } from 'pg';
types.setTypeParser(20, (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) throw new Error('Inteiro fora do limite seguro.');
  return n;
});
const state = globalThis as typeof globalThis & { portalPool?: Pool };
export function getProductionDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');
  const max = Number(process.env.DATABASE_POOL_MAX || 10);
  if (!Number.isInteger(max) || max < 1 || max > 50) throw new Error('DATABASE_POOL_MAX inválido.');
  if(state.portalPool)return state.portalPool;
  state.portalPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000, statement_timeout: 15000,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
  });
  state.portalPool.on('error',()=>console.error(JSON.stringify({event:'database_connection_lost'})));
  return state.portalPool;
}
export async function checkProductionDb() {
  const result = await getProductionDb().query('SELECT id FROM app_migrations WHERE id=$1', ['0001_auth.sql']);
  if (!result.rowCount) throw new Error('Migrações pendentes.');
  await getProductionDb().query('SELECT id FROM users LIMIT 1');
}
export async function closeProductionDb() { await state.portalPool?.end(); delete state.portalPool; }
// SQL is constant application code. User data is always passed separately.
export function rawDatabase() {
  return { prepare(sql: string) {
    let i = 0;
    const text = sql.replace(/\?/g, () => '$'+(++i));
    const statement = (values: unknown[] = []) => ({
      bind: (...bound: unknown[]) => statement(bound),
      async first<T = Record<string, unknown>>(): Promise<T | null> {
        const result = await getProductionDb().query(text, values);
        return (result.rows[0] as T) ?? null;
      },
      async all() { return { results: (await getProductionDb().query(text, values)).rows }; },
      async run() { return { meta: { changes: (await getProductionDb().query(text, values)).rowCount ?? 0 } }; },
    });
    return statement();
  }};
}
