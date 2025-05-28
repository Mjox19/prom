/*
  # Update profiles table schema and policies

  1. Schema Changes
    - Make email, first_name, last_name required
    - Add role column with validation
    - Update existing rows to have default values
  
  2. Security
    - Enable RLS
    - Set up policies for authenticated users
    
  3. Automation
    - Create trigger for new user signup
*/

-- First update existing rows to have non-null values
UPDATE profiles 
SET 
  first_name = COALESCE(first_name, 'Unknown'),
  last_name = COALESCE(last_name, 'User'),
  email = COALESCE(email, id || '@example.com');

-- Now modify the table structure
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create SELECT policy
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create UPDATE policy
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create INSERT policy
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (new.id, new.email, 'New', 'User', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();