/*
  # Implement User Roles and Row Level Security

  1. User Roles System
    - Update profiles table with proper role constraints
    - Define roles: super_admin, admin, user
    - Set up role-based access control

  2. Row Level Security Policies
    - Enable RLS on all sensitive tables
    - Create policies for each role and operation
    - Ensure data isolation and proper access control

  3. Security Features
    - Prevent unauthorized role changes
    - Secure data access based on user roles
    - Implement proper ownership checks
*/

-- First, ensure the profiles table has the correct structure and constraints
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Update the role constraint to include all valid roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'user'));

-- Set default role to 'user' if not specified
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin'
    FROM profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION is_admin_or_super(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin')
    FROM profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can insert profiles" ON profiles;

-- PROFILES TABLE POLICIES
-- Users can read their own profile, super admins can read all
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    is_super_admin(auth.uid())
  );

-- Users can update their own profile (except role), super admins can update anything
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    is_super_admin(auth.uid())
  )
  WITH CHECK (
    -- Users can't change their own role unless they're super admin
    (auth.uid() = id AND (OLD.role = NEW.role OR is_super_admin(auth.uid()))) OR
    is_super_admin(auth.uid())
  );

-- Only super admins can insert new profiles (for user management)
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    auth.uid() = id  -- Allow users to create their own profile
  );

-- Super admins can delete profiles (except their own)
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) AND auth.uid() != id
  );

-- CUSTOMERS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

-- Super admins see all, others see only their own
CREATE POLICY "customers_select_policy" ON customers
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- Users can create customers (will be assigned to them)
CREATE POLICY "customers_insert_policy" ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can update their own customers, super admins can update all
CREATE POLICY "customers_update_policy" ON customers
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can delete their own customers, super admins can delete all
CREATE POLICY "customers_delete_policy" ON customers
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- QUOTES TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "quotes_select_policy" ON quotes;
DROP POLICY IF EXISTS "quotes_insert_policy" ON quotes;
DROP POLICY IF EXISTS "quotes_update_policy" ON quotes;
DROP POLICY IF EXISTS "quotes_delete_policy" ON quotes;

-- Super admins see all, others see only their own
CREATE POLICY "quotes_select_policy" ON quotes
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- Users can create quotes (will be assigned to them)
CREATE POLICY "quotes_insert_policy" ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can update their own quotes, super admins can update all
CREATE POLICY "quotes_update_policy" ON quotes
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can delete their own quotes, super admins can delete all
CREATE POLICY "quotes_delete_policy" ON quotes
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- QUOTE ITEMS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "quote_items_select_policy" ON quote_items;
DROP POLICY IF EXISTS "quote_items_insert_policy" ON quote_items;
DROP POLICY IF EXISTS "quote_items_update_policy" ON quote_items;
DROP POLICY IF EXISTS "quote_items_delete_policy" ON quote_items;

-- Access based on quote ownership
CREATE POLICY "quote_items_select_policy" ON quote_items
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "quote_items_insert_policy" ON quote_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "quote_items_update_policy" ON quote_items
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "quote_items_delete_policy" ON quote_items
  FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );

-- ORDERS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

-- Super admins see all, others see only their own
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- Users can create orders (will be assigned to them)
CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can update their own orders, super admins can update all
CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can delete their own orders, super admins can delete all
CREATE POLICY "orders_delete_policy" ON orders
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- ORDER ITEMS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON order_items;

-- Access based on order ownership
CREATE POLICY "order_items_select_policy" ON order_items
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_policy" ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_update_policy" ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_delete_policy" ON order_items
  FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- DELIVERIES TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "deliveries_select_policy" ON deliveries;
DROP POLICY IF EXISTS "deliveries_insert_policy" ON deliveries;
DROP POLICY IF EXISTS "deliveries_update_policy" ON deliveries;
DROP POLICY IF EXISTS "deliveries_delete_policy" ON deliveries;

-- Access based on order ownership
CREATE POLICY "deliveries_select_policy" ON deliveries
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "deliveries_insert_policy" ON deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "deliveries_update_policy" ON deliveries
  FOR UPDATE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "deliveries_delete_policy" ON deliveries
  FOR DELETE
  TO authenticated
  USING (
    is_super_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- NOTIFICATIONS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- Users see only their own notifications, super admins see all
CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- System can create notifications for users
CREATE POLICY "notifications_insert_policy" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can update their own notifications (mark as read), super admins can update all
CREATE POLICY "notifications_update_policy" ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can delete their own notifications, super admins can delete all
CREATE POLICY "notifications_delete_policy" ON notifications
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- NOTIFICATION PREFERENCES TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "notification_preferences_select_policy" ON notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_insert_policy" ON notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_update_policy" ON notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_delete_policy" ON notification_preferences;

-- Users see only their own preferences, super admins see all
CREATE POLICY "notification_preferences_select_policy" ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can create their own preferences
CREATE POLICY "notification_preferences_insert_policy" ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can update their own preferences, super admins can update all
CREATE POLICY "notification_preferences_update_policy" ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Users can delete their own preferences, super admins can delete all
CREATE POLICY "notification_preferences_delete_policy" ON notification_preferences
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_super_admin(auth.uid())
  );

-- Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user'  -- Default role for new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to promote a user to super admin (can only be called by existing super admin)
CREATE OR REPLACE FUNCTION promote_to_super_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if the calling user is a super admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can promote users to super admin';
  END IF;
  
  -- Update the target user's role
  UPDATE profiles 
  SET role = 'super_admin', updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to change user roles (can only be called by super admin)
CREATE OR REPLACE FUNCTION change_user_role(target_user_id uuid, new_role text)
RETURNS boolean AS $$
BEGIN
  -- Check if the calling user is a super admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change user roles';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('super_admin', 'admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Prevent super admin from demoting themselves
  IF target_user_id = auth.uid() AND new_role != 'super_admin' THEN
    RAISE EXCEPTION 'Super admins cannot demote themselves';
  END IF;
  
  -- Update the target user's role
  UPDATE profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;