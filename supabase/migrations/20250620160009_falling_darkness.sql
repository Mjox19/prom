/*
  # Add quote_number to deliveries table

  1. Changes
    - Add `quote_number` column to deliveries table
    - Update existing deliveries to have quote numbers from their orders
    - Add index for better performance

  2. Security
    - No RLS changes needed as deliveries inherit from orders
*/

-- Add quote_number column to deliveries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliveries' AND column_name = 'quote_number'
  ) THEN
    ALTER TABLE deliveries ADD COLUMN quote_number text;
  END IF;
END $$;

-- Update existing deliveries to have quote numbers from their orders
UPDATE deliveries 
SET quote_number = orders.quote_number
FROM orders 
WHERE deliveries.order_id = orders.id 
AND deliveries.quote_number IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_quote_number ON deliveries(quote_number);