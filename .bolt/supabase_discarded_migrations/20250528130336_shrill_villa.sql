/*
  # Clear database tables

  1. Changes
    - Drop all existing tables in the correct order to handle foreign key constraints
    - Reset sequences
    - Remove triggers and functions

  2. Notes
    - This migration ensures a clean slate for the database
    - All data will be permanently removed
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
DROP TRIGGER IF EXISTS set_quote_number ON quotes;
DROP TRIGGER IF EXISTS notify_quote_conversion ON orders;

-- Drop functions
DROP FUNCTION IF EXISTS create_default_notification_preferences();
DROP FUNCTION IF EXISTS generate_quote_number();
DROP FUNCTION IF EXISTS convert_quote_to_order();

-- Drop tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS quote_number_seq;