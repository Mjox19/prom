/*
  # Orders and Deliveries Schema

  1. New Tables
    - `orders`: Tracks customer orders and their status
    - `order_items`: Links products to orders with quantities and prices
    - `deliveries`: Tracks shipping and delivery status of orders

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own orders
    - Add policies for order items and deliveries linked to user's orders

  3. Performance
    - Add indexes for foreign key relationships
    - Enable real-time updates
*/

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address text NOT NULL,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_description text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create deliveries table
CREATE TABLE deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed')),
  carrier text NOT NULL,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Policies for order_items
CREATE POLICY "Users can view own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

CREATE POLICY "Users can insert own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Policies for deliveries
CREATE POLICY "Users can view own deliveries"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = deliveries.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Add indexes for better performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;

-- Set replica identity for real-time
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_items REPLICA IDENTITY FULL;
ALTER TABLE deliveries REPLICA IDENTITY FULL;