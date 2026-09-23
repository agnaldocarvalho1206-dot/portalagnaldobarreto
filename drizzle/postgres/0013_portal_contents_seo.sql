ALTER TABLE portal_contents ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '';
ALTER TABLE portal_contents ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '';
