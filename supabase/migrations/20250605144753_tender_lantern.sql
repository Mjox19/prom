/*
  # Add Payment Status to Orders Table

  1. Changes
    - Add payment_status column to orders table with options: unpaid, half_paid, fully_paid
    - Set default value to 'unpaid'
    
  2. Updates
    - Add check constraint to ensure valid payment status values
*/

ALTER TABLE orders 
ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
CHECK (payment_status IN ('unpaid', 'half_paid', 'fully_paid'));

-- Update existing orders to have default payment status
UPDATE orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;