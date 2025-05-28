/*
  # Add quote number and payment tracking

  1. Changes
    - Add quote_number to quotes table
    - Add payment tracking fields to orders table
    - Add delivery date to orders table
    - Add quote_id reference to orders table
    - Add trigger to generate sequential quote numbers
*/

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq;

-- Add quote_number to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS quote_number TEXT UNIQUE DEFAULT NULL;

-- Add payment tracking to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := 'Q-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('quote_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate quote numbers
DROP TRIGGER IF EXISTS set_quote_number ON quotes;
CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION generate_quote_number();

-- Create function to handle quote-to-order conversion
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

-- Create trigger for quote-to-order conversion notification
DROP TRIGGER IF EXISTS notify_quote_conversion ON orders;
CREATE TRIGGER notify_quote_conversion
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.quote_id IS NOT NULL)
  EXECUTE FUNCTION convert_quote_to_order();