-- Create custom_foods table for restaurant menus and other non-USDA items
CREATE TABLE IF NOT EXISTS custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  portion TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC(6,1) NOT NULL,
  carbs NUMERIC(6,1) NOT NULL,
  fat NUMERIC(6,1) NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast searching
CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON custom_foods(name);
