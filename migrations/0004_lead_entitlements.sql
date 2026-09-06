PRAGMA foreign_keys = ON;

ALTER TABLE usage_events ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0);
ALTER TABLE usage_events ADD COLUMN source TEXT;
ALTER TABLE usage_events ADD COLUMN correlation_id TEXT;
ALTER TABLE usage_events ADD COLUMN settled_at TEXT;

CREATE UNIQUE INDEX idx_usage_correlation_id ON usage_events(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_usage_lead_window ON usage_events(user_id, action, created_at, quantity);
