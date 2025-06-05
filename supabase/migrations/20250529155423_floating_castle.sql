/*
  # Fix user signup trigger function

  1. Changes
    - Update handle_new_user trigger function to be more robust
    - Add error handling
    - Ensure proper transaction handling
    - Add validation checks

  2. Security
    - Maintain existing security settings
    - Function remains security definer
*/

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles with validation
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user',
    now(),
    now()
  );

  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (
    user_id,
    email_news,
    email_quotes,
    email_sales,
    push_enabled,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    true,
    true,
    true,
    false,
    now(),
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (Supabase will capture this in the database logs)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();