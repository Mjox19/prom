/*
  # Add customer type field to profiles

  1. Changes
    - Add customer_type column to profiles table
    - Add check constraint to ensure valid types
*/

ALTER TABLE profiles
ADD COLUMN customer_type text CHECK (customer_type IN ('reseller', 'end_client'));