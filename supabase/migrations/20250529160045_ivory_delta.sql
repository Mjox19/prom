/*
  # Update orders table schema

  1. Schema Changes
    - Add user_id column to orders table
    - Add foreign key constraint to link orders with auth.users
    - Update RLS policies to use user_id for access control

  2. Security
    - Enable RLS on orders table
    - Add policies for CRUD operations based on user_id
*/

-- Add user_id column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy
CREATE POLICY "Users can create their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update their own orders"
ON orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy
CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create DELETE policy
CREATE POLICY "Users can delete their own orders"
ON orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);