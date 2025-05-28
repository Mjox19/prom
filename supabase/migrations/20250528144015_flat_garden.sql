-- Modify profiles table structure
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Add role check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new policies with unique names
CREATE POLICY "profiles_select_policy"
ON profiles
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
ON profiles
FOR UPDATE
TO public
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy"
ON profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Add trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (new.id, new.email, '', '', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();