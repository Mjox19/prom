/*
  # Add foreign key relationships for orders

  1. Changes
    - Add foreign key constraint between orders and order_items
    - Add foreign key constraint between orders and deliveries
    - Enable RLS on order_items and deliveries tables
    - Add RLS policies for order_items and deliveries

  2. Security
    - Enable RLS on order_items and deliveries tables
    - Add policies to allow users to manage their own orders' items and deliveries
*/

-- Add foreign key constraints
ALTER TABLE public.order_items
ADD CONSTRAINT fk_order_id
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.deliveries
ADD CONSTRAINT fk_order_id
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for order_items
CREATE POLICY "Users can manage their own order items"
ON public.order_items
FOR ALL
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- Add RLS policies for deliveries
CREATE POLICY "Users can manage their own order deliveries"
ON public.deliveries
FOR ALL
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);