/*
  # Update quote number generation with language prefixes

  1. Changes
    - Add language prefix to quote numbers based on customer's contact language
    - Maintain sequential numbering for each language prefix
    - Create separate sequences for each language

  2. Features
    - Language-specific prefixes (NL, FR, EU, ES)
    - Sequential numbering per language
    - Automatic prefix selection based on customer language
*/

-- Create sequences for each language
CREATE SEQUENCE IF NOT EXISTS quote_number_seq_nl;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq_fr;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq_es;
CREATE SEQUENCE IF NOT EXISTS quote_number_seq_eu;

-- Drop existing quote number generation function
DROP FUNCTION IF EXISTS generate_quote_number();

-- Create new quote number generation function with language support
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    language_code text;
    sequence_val text;
    customer_language text;
BEGIN
    -- Get customer's contact language
    SELECT contact_language INTO customer_language
    FROM customers
    WHERE id = NEW.customer_id;

    -- Set language code based on customer's contact language
    CASE customer_language
        WHEN 'dutch' THEN
            language_code := 'NL';
            sequence_val := LPAD(nextval('quote_number_seq_nl')::TEXT, 6, '0');
        WHEN 'french' THEN
            language_code := 'FR';
            sequence_val := LPAD(nextval('quote_number_seq_fr')::TEXT, 6, '0');
        WHEN 'spanish' THEN
            language_code := 'ES';
            sequence_val := LPAD(nextval('quote_number_seq_es')::TEXT, 6, '0');
        ELSE
            language_code := 'EU';
            sequence_val := LPAD(nextval('quote_number_seq_eu')::TEXT, 6, '0');
    END CASE;

    -- Generate quote number with language prefix
    NEW.quote_number := language_code || '-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || sequence_val;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger
DROP TRIGGER IF EXISTS set_quote_number ON quotes;

-- Recreate trigger
CREATE TRIGGER set_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quote_number();