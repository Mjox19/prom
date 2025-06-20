/*
  # Update Quote Numbering System

  1. Changes
    - Update quote number generation to use year-based numbering
    - Modify the generate_quote_number function to create numbers like "2025-000001"
    - Add "ordered" status to quote status check constraint
    
  2. Security
    - No changes to existing RLS policies
*/

-- Update the quote status check constraint to include "ordered"
ALTER TABLE quotes 
DROP CONSTRAINT IF EXISTS quotes_status_check;

ALTER TABLE quotes 
ADD CONSTRAINT quotes_status_check 
CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired', 'ordered'));

-- Create a new sequence for year-based quote numbering
CREATE SEQUENCE IF NOT EXISTS quote_number_yearly_seq;

-- Update the quote number generation function
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year text;
    sequence_val text;
    customer_language text;
    language_prefix text;
BEGIN
    -- Get current year
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get customer language for prefix
    SELECT contact_language INTO customer_language
    FROM customers
    WHERE id = NEW.customer_id;

    -- Determine language prefix
    CASE customer_language
        WHEN 'dutch' THEN language_prefix := 'NL';
        WHEN 'french' THEN language_prefix := 'FR';
        WHEN 'spanish' THEN language_prefix := 'ES';
        ELSE language_prefix := 'EU';
    END CASE;

    -- Get next sequence value and format it
    sequence_val := LPAD(nextval('quote_number_yearly_seq')::TEXT, 6, '0');

    -- Create quote number: LANGUAGE-YEAR-SEQUENCE (e.g., EU-2025-000001)
    NEW.quote_number := language_prefix || '-' || current_year || '-' || sequence_val;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS set_quote_number ON quotes;
CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION generate_quote_number();