CREATE TABLE IF NOT EXISTS support_tickets (
 id text PRIMARY KEY,client_id text REFERENCES crm_clients(id) ON DELETE SET NULL,
 project_id text REFERENCES client_projects(id) ON DELETE SET NULL,
 subject text NOT NULL,priority text NOT NULL DEFAULT 'Normal',
 status text NOT NULL DEFAULT 'Aberto',message text NOT NULL DEFAULT '',
 created bigint NOT NULL,updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_client ON support_tickets(client_id);
