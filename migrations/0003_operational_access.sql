PRAGMA foreign_keys = ON;

CREATE TABLE operational_access_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_operational_access_active ON operational_access_tokens(token_hash, revoked_at, expires_at);
CREATE INDEX idx_operational_access_user ON operational_access_tokens(user_id, created_at DESC);
