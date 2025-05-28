/*
  # Create quotes schema with payment tracking

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `quote_number` (text, unique)
      - `customer_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `items` (jsonb)
      - `subtotal` (numeric)
      - `tax` (numeric)
      - `total` (numeric)
      - `status` (text)
      - `valid_until` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Orders Table
    - Add quote_id reference
    - Add payment tracking columns
    - Add delivery date

  3. Security
    - Enable RLS on quotes table
    - Add policies for authenticated users
    - Create triggers for quote number generation
    - Create triggers for notifications
*/

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq;

-- Create quotes table
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE DEFAULT NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')) DEFAULT 'draft',
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add payment tracking to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status text CHECK (payment_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_date timestamptz,
ADD COLUMN IF NOT EXISTS delivery_date timestamptz;

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Users can view own quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete own quotes"
  ON quotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := 'Q-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('quote_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate quote numbers
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
CREATE TRIGGER notify_quote_conversion
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.quote_id IS NOT NULL)
  EXECUTE FUNCTION convert_quote_to_order();

-- Create function to handle quote status updates
CREATE OR REPLACE FUNCTION handle_quote_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      NEW.customer_id,
      'Quote Status Updated',
      'Quote #' || NEW.quote_number || ' status has been updated to ' || NEW.status,
      'quote'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote status changes
CREATE TRIGGER notify_quote_status_change
  AFTER UPDATE OF status ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION handle_quote_status_change();

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;

-- Set replica identity for real-time
ALTER TABLE quotes REPLICA IDENTITY FULL;

-- Create index for better performance
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);