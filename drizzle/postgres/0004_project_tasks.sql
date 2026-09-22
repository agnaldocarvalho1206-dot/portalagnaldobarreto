CREATE TABLE IF NOT EXISTS project_tasks (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'A fazer' CHECK (status IN ('A fazer','Em andamento','Em revisão','Concluída','Cancelada')),
  priority text NOT NULL DEFAULT 'Média' CHECK (priority IN ('Baixa','Média','Alta','Urgente')),
  due_date text NOT NULL DEFAULT '',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS project_tasks_status ON project_tasks(status);
