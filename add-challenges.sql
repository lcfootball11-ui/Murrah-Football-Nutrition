-- Bi-weekly challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  goal_type text NOT NULL CHECK (goal_type IN ('reps', 'minutes', 'miles', 'calories')),
  goal_total numeric NOT NULL,
  unit text NOT NULL,
  reward text,
  scope text NOT NULL DEFAULT 'team' CHECK (scope IN ('team', 'position')),
  position_group text, -- null means team-wide
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Individual athlete submissions toward a challenge
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  video_url text,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS challenge_submissions_challenge_id ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_submissions_user_id ON challenge_submissions(user_id);

-- RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Challenges: anyone authenticated can read; only coaches can write
CREATE POLICY "challenges_read" ON challenges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "challenges_coach_write" ON challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);

-- Submissions: athletes read their own + aggregates; coaches read all
CREATE POLICY "submissions_own_read" ON challenge_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "submissions_own_insert" ON challenge_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions_coach_all" ON challenge_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);
