/*
  # Update quote workflow

  1. Changes
    - Add quote number sequence and field
    - Add payment tracking fields to orders
    - Add triggers for quote number generation and notifications
    - Add quote-to-order relationship

  2. Security
    - Maintain existing RLS policies
    - Add check constraints for payment status
*/

-- Only create sequence if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'quote_number_seq') THEN
    CREATE SEQUENCE quote_number_seq;
  END IF;
END $$;

-- Add quote_number to quotes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'quote_number'
  ) THEN
    ALTER TABLE quotes ADD COLUMN quote_number TEXT UNIQUE DEFAULT NULL;
  END IF;
END $$;

-- Add payment tracking to orders if columns don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'quote_id'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
      ADD COLUMN payment_status TEXT CHECK (payment_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
      ADD COLUMN payment_amount NUMERIC(10,2) DEFAULT 0,
      ADD COLUMN payment_date TIMESTAMPTZ,
      ADD COLUMN delivery_date TIMESTAMPTZ;
  END IF;
END $$;

-- Create or replace function for quote number generation
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := 'Q-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('quote_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for quote number generation
DROP TRIGGER IF EXISTS set_quote_number ON quotes;
CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL)
  EXECUTE FUNCTION generate_quote_number();

-- Create or replace function for quote-to-order conversion notification
CREATE OR REPLACE FUNCTION convert_quote_to_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a notification for the customer
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    NEW.customer_id,
    'Quote Converted to Order',
    'Quote #' || (SELECT quote_number FROM quotes WHERE id = NEW.quote_id) || ' has been converted to an order.',
    'system'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for quote conversion notification
DROP TRIGGER IF EXISTS notify_quote_conversion ON orders;
CREATE TRIGGER notify_quote_conversion
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.quote_id IS NOT NULL)
  EXECUTE FUNCTION convert_quote_to_order();