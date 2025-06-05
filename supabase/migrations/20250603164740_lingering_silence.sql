/*
  # Remove RLS from orders table
  
  1. Changes
    - Disable RLS on orders table
    - Drop existing RLS policies
    - Keep user_id column for data organization
*/

-- Disable RLS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;