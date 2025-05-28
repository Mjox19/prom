/*
  # Fix profiles RLS policies

  1. Changes
    - Drop existing UPDATE policy and create a new one with proper checks
    - Ensure authenticated users can update their own profiles

  2. Security
    - Maintains RLS enabled on profiles table
    - Adds proper UPDATE policy with both USING and WITH CHECK clauses
    - Keeps existing SELECT policy intact
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new UPDATE policy with proper checks
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);