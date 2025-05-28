/*
  # Update foreign key references

  1. Changes
    - Update foreign key references in quotes, orders, and notifications tables
    - Change references from profiles to customers table

  2. Security
    - No changes to RLS policies
*/

-- Update foreign keys in quotes table
ALTER TABLE quotes
DROP CONSTRAINT quotes_customer_id_fkey,
ADD CONSTRAINT quotes_customer_id_fkey
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE;

-- Update foreign keys in orders table
ALTER TABLE orders
DROP CONSTRAINT orders_customer_id_fkey,
ADD CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id)
    REFERENCES customers(id)
    ON DELETE CASCADE;