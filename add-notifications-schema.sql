-- Notifications table for weight tracking alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('weight_stale', 'weight_reminder')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  related_athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users view own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users update own notifications" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users delete own notifications" ON notifications FOR DELETE
  USING (auth.uid() = user_id);
