/*
  # Add Insert Policy for Profiles Table

  1. Security Changes
    - Add RLS policy to allow authenticated users to insert new profiles
    - Policy allows any authenticated user to create new profiles
    - This complements existing policies for SELECT and UPDATE operations

  Note: This policy is necessary to support customer creation functionality
  while maintaining security through RLS.
*/

CREATE POLICY "Users can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);