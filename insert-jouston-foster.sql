-- Insert Jouston Foster athlete profile matching the Excel data
-- Weight Gain plan: 151 lbs → 175 lbs

INSERT INTO profiles (id, email, full_name, role, phone_number, reminder_enabled, target_weight, goal_weight)
VALUES (
  gen_random_uuid(),
  'jouston.foster@school.edu',
  'Jouston Foster',
  'athlete',
  NULL,
  true,
  151,
  175
) ON CONFLICT DO NOTHING;

-- Insert nutrition targets (Weight Gain: 2,716 cal, 175g protein)
WITH athlete AS (
  SELECT id FROM profiles WHERE full_name = 'Jouston Foster' AND role = 'athlete'
)
INSERT INTO macro_targets (user_id, calories, protein, carbs, fat, plan, target_weight, goal_weight)
SELECT
  athlete.id,
  2716,    -- Starting calories from Week 0
  175,     -- Target protein per day
  340,     -- Estimated carbs (assuming standard gain macro split)
  90,      -- Estimated fat (assuming standard gain macro split)
  'gain',
  151,
  175
FROM athlete
ON CONFLICT DO NOTHING;
