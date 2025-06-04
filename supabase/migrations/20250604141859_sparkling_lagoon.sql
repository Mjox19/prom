/*
  # Fix Database Structure

  1. Changes
    - Drop existing orders table if it exists
    - Create new orders table with correct structure
    - Add necessary foreign key constraints
    - Disable RLS on orders table
    
  2. Security
    - RLS disabled for orders table
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with correct structure
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'::text
    CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  total_amount numeric(10,2) DEFAULT 0 NOT NULL,
  shipping_address text NOT NULL,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

-- Disable RLS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;