-- Weight tracking table for point-in-time storage of athlete weight
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weight_lbs NUMERIC(6,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_log_date ON weight_logs(log_date);

-- Row Level Security
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "athletes view own weight logs" ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "athletes insert own weight logs" ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "athletes update own weight logs" ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "athletes delete own weight logs" ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "coaches view all weight logs" ON weight_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'coach'));
