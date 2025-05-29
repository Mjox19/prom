/*
  # Fix Customer RLS Policies

  1. Changes
    - Add user_id column to customers table
    - Update RLS policies for customers table to enforce user ownership
    
  2. Security
    - Enable RLS on customers table
    - Add policies for authenticated users to:
      - Insert customers they own
      - Update their own customers
      - View their own customers
*/

-- Add user_id column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can view customers" ON customers;

-- Create new RLS policies
CREATE POLICY "Users can insert their own customers"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
ON customers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own customers"
ON customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);