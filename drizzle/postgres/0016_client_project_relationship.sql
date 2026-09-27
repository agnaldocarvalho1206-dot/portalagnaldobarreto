-- H03: relacionamento operacional entre CRM e projetos do Portal do Cliente.
-- Adiciona as colunas já consumidas pela aplicação e recupera vínculos existentes.

ALTER TABLE client_projects
  ADD COLUMN IF NOT EXISTS client_id text REFERENCES crm_clients(id) ON DELETE SET NULL;

ALTER TABLE client_projects
  ADD COLUMN IF NOT EXISTS updated bigint NOT NULL DEFAULT 0;

UPDATE client_projects
SET updated = created
WHERE updated = 0;

UPDATE client_projects AS project
SET client_id = client.id
FROM crm_clients AS client
WHERE project.client_id IS NULL
  AND (
    client.lead_id = project.lead_id
    OR (
      project.user_id IS NOT NULL
      AND client.user_id IS NOT NULL
      AND client.user_id = project.user_id
    )
  );

CREATE INDEX IF NOT EXISTS projects_client ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS projects_updated ON client_projects(updated);
