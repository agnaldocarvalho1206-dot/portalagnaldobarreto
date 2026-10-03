ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_role text NOT NULL DEFAULT 'operator';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by_operator boolean NOT NULL DEFAULT TRUE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_by_client boolean NOT NULL DEFAULT TRUE;

-- Mensagens legadas permanecem como lidas; novas mensagens passam a controlar leitura por destinatário.
CREATE INDEX IF NOT EXISTS messages_operator_unread ON messages (read_by_operator, created) WHERE sender_role='client';
CREATE INDEX IF NOT EXISTS messages_client_unread ON messages (read_by_client, created) WHERE sender_role='operator';
