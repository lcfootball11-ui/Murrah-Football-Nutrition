-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
