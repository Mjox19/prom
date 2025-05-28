/*
  # Update quotes table RLS policies

  1. Changes
    - Drop existing RLS policies for quotes table
    - Add new policies that properly handle quote access based on customer_id
    - Ensure authenticated users can only access quotes where they are the customer

  2. Security
    - Enable RLS on quotes table (already enabled)
    - Add policies for INSERT, UPDATE, and SELECT operations
    - Policies ensure users can only access their own quotes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;

-- Create new policies
CREATE POLICY "Users can create quotes"
ON quotes
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
);

CREATE POLICY "Users can update own quotes"
ON quotes
FOR UPDATE
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can view own quotes"
ON quotes
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own quotes"
ON quotes
FOR DELETE
TO authenticated
USING (customer_id = auth.uid());