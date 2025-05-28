/*
  # Add full_name column to profiles table

  1. Changes
    - Add `full_name` column to `profiles` table
    - Make it nullable to avoid issues with existing records
    - Add index for performance on name searches

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
    CREATE INDEX idx_profiles_full_name ON profiles (full_name);
  END IF;
END $$;