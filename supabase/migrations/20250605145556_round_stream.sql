-- Disable RLS on all tables
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can manage their own order deliveries" ON public.deliveries;

-- Add/update foreign key relationships
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS fk_order_id,
ADD CONSTRAINT fk_order_id
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.deliveries
DROP CONSTRAINT IF EXISTS fk_order_id,
ADD CONSTRAINT fk_order_id
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;