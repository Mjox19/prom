/*
  # Fix SMTP Settings Table

  1. Changes
    - Create smtp_settings table with correct schema
    - Add RLS policies for super admins
    - Insert default settings
    
  2. Security
    - Only super admins can manage SMTP settings
*/

-- Create SMTP settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS smtp_settings (
  id text PRIMARY KEY,
  host text NOT NULL,
  port integer NOT NULL,
  secure boolean NOT NULL DEFAULT false,
  auth boolean NOT NULL DEFAULT false,
  username text,
  password text,
  from_email text NOT NULL,
  from_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for super admins only
DROP POLICY IF EXISTS "Super admins can manage SMTP settings" ON smtp_settings;

CREATE POLICY "Super admins can manage SMTP settings"
ON smtp_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Insert default settings if they don't exist
INSERT INTO smtp_settings (id, host, port, secure, auth, username, password, from_email, from_name)
VALUES ('default', 'localhost', 2525, false, false, '', '', 'sales@promocups.com', 'Promocups Sales')
ON CONFLICT (id) DO NOTHING;