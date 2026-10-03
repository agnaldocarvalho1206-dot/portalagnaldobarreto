-- H87: projetos podem nascer diretamente de um cliente cadastrado, sem lead de origem.
-- A FK com leads continua válida quando lead_id estiver preenchido.
ALTER TABLE client_projects
  ALTER COLUMN lead_id DROP NOT NULL;
