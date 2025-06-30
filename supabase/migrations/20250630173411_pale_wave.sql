/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required) - Product name
      - `category` (text, optional) - Product category
      - `description` (text, optional) - Product description
      - `price_tiers` (jsonb, required) - Pricing tiers with quantity breaks
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to read products
    - Add policies for super admins to manage products

  3. Indexes
    - Add index on name for faster searching
    - Add index on category for filtering
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  price_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING btree (name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products USING btree (category);

-- Insert sample products
INSERT INTO products (name, category, description, price_tiers) VALUES
(
  'Standard Software License',
  'Software',
  'A standard license for our flagship software.',
  '[
    {"upToQuantity": 10, "price": 1200.00},
    {"upToQuantity": 100, "price": 1100.00},
    {"upToQuantity": 10000, "price": 1000.00}
  ]'::jsonb
),
(
  'Premium Support Package',
  'Service',
  '1-year premium support with 24/7 access.',
  '[{"upToQuantity": 10000, "price": 500.00}]'::jsonb
),
(
  'Consulting Hour',
  'Service',
  'One hour of expert consultation.',
  '[{"upToQuantity": 10000, "price": 150.00}]'::jsonb
),
(
  'Hardware Component A',
  'Hardware',
  'Essential hardware component for system integration.',
  '[{"upToQuantity": 10000, "price": 350.00}]'::jsonb
),
(
  'Training Workshop',
  'Training',
  'Full-day training workshop for up to 10 people.',
  '[{"upToQuantity": 10000, "price": 2000.00}]'::jsonb
);