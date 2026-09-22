CREATE TABLE IF NOT EXISTS portal_contents (
 id text PRIMARY KEY,title text NOT NULL,content_type text NOT NULL DEFAULT 'Post',
 status text NOT NULL DEFAULT 'Rascunho',slug text NOT NULL DEFAULT '',summary text NOT NULL DEFAULT '',
 published_at text NOT NULL DEFAULT '',created bigint NOT NULL,updated bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS portal_contents_slug_unique ON portal_contents(slug) WHERE slug <> '';
CREATE INDEX IF NOT EXISTS portal_contents_status ON portal_contents(status);
