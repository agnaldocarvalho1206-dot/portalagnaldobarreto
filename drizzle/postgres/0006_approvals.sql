CREATE TABLE IF NOT EXISTS approvals (
  id text PRIMARY KEY,
  project_id text REFERENCES client_projects(id) ON DELETE SET NULL,
  proposal_id text REFERENCES proposals(id) ON DELETE SET NULL,
  title text NOT NULL,
  item_type text NOT NULL DEFAULT 'Entrega' CHECK (item_type IN ('Entrega','Proposta','Layout','Conteúdo','Outro')),
  status text NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Rejeitado','Cancelado')),
  notes text NOT NULL DEFAULT '',
  decision_notes text NOT NULL DEFAULT '',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS approvals_project ON approvals(project_id);
CREATE INDEX IF NOT EXISTS approvals_status ON approvals(status);
