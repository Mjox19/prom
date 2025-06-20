/*
  # Add quote_number to orders table

  1. Changes
    - Add `quote_number` column to orders table
    - Add unique constraint to ensure no duplicate quote numbers
    - Add index for better performance

  2. Security
    - No RLS changes needed as orders already have proper RLS
*/

-- Add quote_number column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'quote_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN quote_number text;
  END IF;
END $$;

-- Add unique constraint for quote numbers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_quote_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_quote_number_key UNIQUE (quote_number);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_quote_number ON orders(quote_number);