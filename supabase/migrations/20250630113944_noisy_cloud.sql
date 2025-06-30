/*
  # Add foreign key relationship between quotes and quote_items

  1. Changes
    - Add foreign key constraint from quote_items.quote_id to quotes.id
    - This will enable Supabase to understand the relationship for joins

  2. Security
    - No changes to existing RLS policies
    - Foreign key constraint ensures data integrity
*/

-- Add foreign key constraint from quote_items to quotes
ALTER TABLE quote_items 
ADD CONSTRAINT fk_quote_items_quote_id 
FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;