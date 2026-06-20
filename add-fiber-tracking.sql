-- Add fiber tracking to nutrition_logs and macro_targets
-- Run this in the Supabase SQL editor

ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS fiber numeric DEFAULT 0;
ALTER TABLE macro_targets ADD COLUMN IF NOT EXISTS fiber numeric DEFAULT 25;
