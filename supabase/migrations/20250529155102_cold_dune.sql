-- Enable RLS
alter table customers enable row level security;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_id uuid references auth.users(id);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'Users can insert their own customers'
  ) THEN
    DROP POLICY "Users can insert their own customers" ON customers;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'Users can update their own customers'
  ) THEN
    DROP POLICY "Users can update their own customers" ON customers;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'Users can view their own customers'
  ) THEN
    DROP POLICY "Users can view their own customers" ON customers;
  END IF;
END $$;

-- Create policies
create policy "Users can insert their own customers"
on customers for insert
to authenticated
with check (
  auth.uid() = user_id
);

create policy "Users can update their own customers"
on customers for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

create policy "Users can view their own customers"
on customers for select
to authenticated
using (
  auth.uid() = user_id
);