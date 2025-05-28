/*
  # Update profiles table with customer fields

  1. Changes
    - Add company_name column
    - Add contact_language column with validation
    - Add country column
    - Add customer_type column with validation
    - Add phone column
    - Add address column
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Add validation constraints
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS contact_language text CHECK (contact_language IN ('english', 'french', 'spanish', 'dutch')),
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS customer_type text CHECK (customer_type IN ('reseller', 'end_client')),
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies with updated fields
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add index for company name searches
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON profiles(company_name);