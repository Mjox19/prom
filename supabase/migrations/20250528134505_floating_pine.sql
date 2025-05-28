/*
  # Create customers table and policies

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `company_name` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `country` (text)
      - `address` (text)
      - `contact_language` (text)
      - `customer_type` (text)
      - `bio` (text)

  2. Security
    - Enable RLS on `customers` table
    - Add policies for authenticated users to:
      - View all customers
      - Insert new customers
      - Update customers
      - Delete customers

  3. Constraints
    - Check constraints for contact_language and customer_type
    - Unique constraint on email
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    company_name text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    country text,
    address text,
    contact_language text DEFAULT 'english'::text NOT NULL,
    customer_type text DEFAULT 'end_client'::text NOT NULL,
    bio text,
    CONSTRAINT customers_email_key UNIQUE (email),
    CONSTRAINT customers_contact_language_check CHECK (contact_language = ANY (ARRAY['english'::text, 'french'::text, 'spanish'::text, 'dutch'::text])),
    CONSTRAINT customers_customer_type_check CHECK (customer_type = ANY (ARRAY['reseller'::text, 'end_client'::text]))
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view customers"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
    ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
    ON public.customers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete customers"
    ON public.customers
    FOR DELETE
    TO authenticated
    USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();