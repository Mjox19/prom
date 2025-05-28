/*
  # Update profiles table with new fields

  1. Changes
    - Add company_name column
    - Add contact_language column with language options
    - Add country column
*/

ALTER TABLE profiles
ADD COLUMN company_name text,
ADD COLUMN contact_language text CHECK (contact_language IN ('english', 'french', 'spanish', 'dutch')),
ADD COLUMN country text;