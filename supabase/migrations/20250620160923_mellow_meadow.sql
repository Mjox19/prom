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

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_quote_number ON deliveries(quote_number);