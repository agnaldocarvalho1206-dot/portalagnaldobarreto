CREATE TABLE IF NOT EXISTS financial_entries (
  id text PRIMARY KEY,
  client_id text REFERENCES crm_clients(id) ON DELETE SET NULL,
  project_id text REFERENCES client_projects(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('Receita','Despesa')),
  description text NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  due_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Pago','Vencido','Cancelado')),
  category text NOT NULL DEFAULT 'Geral',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS financial_entries_due ON financial_entries(due_date);
CREATE INDEX IF NOT EXISTS financial_entries_status ON financial_entries(status);
CREATE INDEX IF NOT EXISTS financial_entries_client ON financial_entries(client_id);
