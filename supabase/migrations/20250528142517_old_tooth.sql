-- Drop existing trigger and function
DROP TRIGGER IF EXISTS set_quote_number ON quotes CASCADE;
DROP FUNCTION IF EXISTS generate_quote_number() CASCADE;

-- Create new quote number generation function that also sets the title
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

    -- Generate quote number
    NEW.quote_number := language_code || '-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || sequence_val;
    
    -- Set the title to be the same as the quote number
    NEW.title := NEW.quote_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER set_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quote_number();