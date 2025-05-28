/*
  # Clear quotes and sales data

  This migration safely removes all quotes and sales data while preserving the table structure.
*/

-- Clear quotes table
TRUNCATE quotes CASCADE;

-- Reset the quote number sequence
ALTER SEQUENCE quote_number_seq RESTART WITH 1;

-- Clear orders table (which contains sales data)
TRUNCATE orders CASCADE;

-- Clear notifications related to quotes and sales
DELETE FROM notifications WHERE type IN ('quote', 'sale');