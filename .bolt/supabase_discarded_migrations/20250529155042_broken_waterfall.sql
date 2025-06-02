-- Enable RLS
alter table customers enable row level security;

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