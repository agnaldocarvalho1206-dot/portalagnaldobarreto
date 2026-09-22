CREATE TABLE IF NOT EXISTS portal_settings (
 key text PRIMARY KEY,
 value text NOT NULL DEFAULT '',
 updated bigint NOT NULL
);
INSERT INTO portal_settings (key,value,updated) VALUES
 ('brand_name','Agnaldo Barreto Web Designer',0),
 ('support_email','',0),
 ('whatsapp','',0),
 ('timezone','America/Sao_Paulo',0),
 ('maintenance_mode','false',0)
ON CONFLICT (key) DO NOTHING;
