PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'deletion_requested'));
ALTER TABLE users ADD COLUMN email_verified_at TEXT;
ALTER TABLE users ADD COLUMN updated_at TEXT;
ALTER TABLE users ADD COLUMN suspended_reason TEXT;

-- Existing accounts were created before verification existed. Preserve their access.
UPDATE users
SET email_verified_at = COALESCE(email_verified_at, created_at),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Safe if the owner account already exists; new owner accounts are promoted only after verification.
UPDATE users SET role = 'admin' WHERE email = 'eduardonunesdrops@gmail.com';

ALTER TABLE sessions ADD COLUMN revoked_at TEXT;
ALTER TABLE sessions ADD COLUMN last_seen_at TEXT;

CREATE TABLE account_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  target_user_id TEXT,
  action TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE auth_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  document TEXT NOT NULL CHECK (document IN ('terms', 'privacy')),
  version TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE account_deletion_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_account_tokens_user_purpose ON account_tokens(user_id, purpose, expires_at);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_audit_events_target ON audit_events(target_user_id, created_at DESC);
CREATE INDEX idx_auth_rate_limits_expires_at ON auth_rate_limits(expires_at);
CREATE INDEX idx_users_admin_filters ON users(status, plan, created_at DESC);
CREATE INDEX idx_sessions_user_active ON sessions(user_id, revoked_at, expires_at);
