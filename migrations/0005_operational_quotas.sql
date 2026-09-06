ALTER TABLE usage_events ADD COLUMN reserved_quantity INTEGER NOT NULL DEFAULT 1 CHECK (reserved_quantity >= 0);
UPDATE usage_events SET reserved_quantity = quantity;
CREATE INDEX IF NOT EXISTS idx_usage_events_action_window
  ON usage_events (user_id, action, created_at);
