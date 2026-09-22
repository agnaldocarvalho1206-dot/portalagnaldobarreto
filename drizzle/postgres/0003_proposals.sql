CREATE TABLE IF NOT EXISTS proposals (
  id text PRIMARY KEY,
  client_id text REFERENCES crm_clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount_cents bigint NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho','Enviada','Aprovada','Recusada','Expirada')),
  valid_until text NOT NULL DEFAULT '',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS proposals_client ON proposals(client_id);
CREATE INDEX IF NOT EXISTS proposals_status ON proposals(status);
