CREATE TABLE IF NOT EXISTS portal_documents (
  id text PRIMARY KEY,
  client_id text REFERENCES crm_clients(id) ON DELETE SET NULL,
  project_id text REFERENCES client_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'Outro' CHECK (document_type IN ('Contrato','Proposta','Briefing','Relatório','Comprovante','Outro')),
  file_url text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Arquivado')),
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS portal_documents_client ON portal_documents(client_id);
CREATE INDEX IF NOT EXISTS portal_documents_project ON portal_documents(project_id);
CREATE INDEX IF NOT EXISTS portal_documents_type ON portal_documents(document_type);
