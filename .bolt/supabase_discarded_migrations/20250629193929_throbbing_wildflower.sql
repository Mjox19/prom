/*
  # Create Email Logs Table

  1. New Tables
    - `email_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `to` (text, recipient email)
      - `subject` (text)
      - `template` (text, template name used)
      - `status` (text: sent, failed, pending)
      - `error` (text, error message if failed)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `email_logs` table
    - Add policy for super admins to view all logs
    - Add policy for users to view their own logs
*/

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  subject text NOT NULL,
  template text,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can view all email logs"
ON email_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Users can view their own email logs"
ON email_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert email logs"
ON email_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);