/*
  # Fix quotes table customer relationship

  1. Changes
    - Drop existing foreign key constraint
    - Add new foreign key constraint to customers table
    - Update RLS policies to use user_id for ownership
    - Add index for better performance
*/

-- Drop existing foreign key constraint if it exists
ALTER TABLE quotes
DROP CONSTRAINT IF EXISTS quotes_customer_id_fkey;

-- Add new foreign key constraint to customers table
ALTER TABLE quotes
ADD CONSTRAINT quotes_customer_id_fkey
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE;

-- Add index for customer_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;

-- Create new RLS policies based on user_id
CREATE POLICY "Users can create quotes"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
ON quotes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quotes"
ON quotes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
ON quotes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);