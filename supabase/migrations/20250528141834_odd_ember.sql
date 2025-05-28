/*
  # Add user_id to quotes table and update RLS policies

  1. Changes
    - Add user_id column to quotes table
    - Update RLS policies to check user_id instead of customer_id
    - Add foreign key constraint to link user_id to profiles table

  2. Security
    - Enable RLS on quotes table
    - Add policies for authenticated users to:
      - Insert quotes they own
      - Update quotes they own
      - Delete quotes they own
      - Select quotes they own
*/

-- Add user_id column
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id);

-- Update existing RLS policies
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;

-- Create new RLS policies
CREATE POLICY "Users can create quotes"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
ON quotes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
ON quotes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quotes"
ON quotes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Set user_id for existing quotes (if any)
UPDATE quotes
SET user_id = customer_id
WHERE user_id IS NULL;