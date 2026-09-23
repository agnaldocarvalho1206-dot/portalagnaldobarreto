ALTER TABLE portal_contents ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Estratégia';
ALTER TABLE portal_contents ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '';
ALTER TABLE portal_contents ADD COLUMN IF NOT EXISTS minutes text NOT NULL DEFAULT '3 min';
CREATE INDEX IF NOT EXISTS portal_contents_publication ON portal_contents(status, published_at);
