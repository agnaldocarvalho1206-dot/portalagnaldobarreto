CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY, user_id text, name text NOT NULL, email text NOT NULL,
  phone text NOT NULL, company text NOT NULL, service text NOT NULL,
  budget text NOT NULL, deadline text NOT NULL, message text NOT NULL,
  status text NOT NULL DEFAULT 'Recebido', created bigint NOT NULL, ip_hash text NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_owner ON leads (user_id);
CREATE INDEX IF NOT EXISTS leads_rate ON leads (ip_hash, created);
CREATE TABLE IF NOT EXISTS client_projects (
  id text PRIMARY KEY, lead_id text NOT NULL REFERENCES leads(id), user_id text,
  name text NOT NULL, phase text NOT NULL, progress integer NOT NULL DEFAULT 0,
  deadline text NOT NULL, description text NOT NULL, created bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS projects_owner ON client_projects (user_id);
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY, project_id text NOT NULL REFERENCES client_projects(id),
  user_id text NOT NULL, author text NOT NULL, body text NOT NULL, created bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_project ON messages (project_id, created);
CREATE INDEX IF NOT EXISTS messages_user_rate ON messages (user_id, created);
CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS subscribers (email text PRIMARY KEY, created bigint NOT NULL);
