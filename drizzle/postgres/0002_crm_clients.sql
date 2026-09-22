CREATE TABLE IF NOT EXISTS crm_clients (
  id text PRIMARY KEY,
  lead_id text REFERENCES leads(id) ON DELETE SET NULL,
  user_id text,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Prospect','Inativo')),
  notes text NOT NULL DEFAULT '',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS crm_clients_email_unique ON crm_clients (lower(email));
CREATE INDEX IF NOT EXISTS crm_clients_status ON crm_clients(status);
CREATE INDEX IF NOT EXISTS crm_clients_user ON crm_clients(user_id);
