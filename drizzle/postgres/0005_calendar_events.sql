CREATE TABLE IF NOT EXISTS calendar_events (
  id text PRIMARY KEY,
  project_id text REFERENCES client_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_date text NOT NULL,
  event_time text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'Compromisso' CHECK (event_type IN ('Compromisso','Reunião','Entrega','Prazo','Outro')),
  notes text NOT NULL DEFAULT '',
  created bigint NOT NULL,
  updated bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS calendar_events_project ON calendar_events(project_id);
