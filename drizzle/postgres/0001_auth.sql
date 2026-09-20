CREATE TABLE users (
  id text PRIMARY KEY, email text NOT NULL UNIQUE CHECK (email = lower(email)),
  name text NOT NULL, password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','client')),
  active boolean NOT NULL DEFAULT true, created bigint NOT NULL
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires bigint NOT NULL, created bigint NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE TABLE rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires bigint NOT NULL);
CREATE INDEX rate_limits_expiry ON rate_limits(expires);
ALTER TABLE client_projects ADD CONSTRAINT valid_progress CHECK (progress BETWEEN 0 AND 100);
