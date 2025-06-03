/*
  # Add user_id to orders table

  1. Changes
    - Add user_id column to orders table
    - Set foreign key constraint to users table
    - Enable RLS
    - Add RLS policies for user access control

  2. Security
    - Enable RLS on orders table
    - Add policies for authenticated users to:
      - Insert their own orders
      - Select their own orders
      - Update their own orders
      - Delete their own orders
*/

-- Add user_id column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
ON orders FOR DELETE TO authenticated
USING (auth.uid() = user_id);