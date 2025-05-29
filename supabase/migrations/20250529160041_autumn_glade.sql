/*
  # Add RLS policies for notification preferences

  1. Security Changes
    - Add INSERT policy for notification_preferences table to allow authenticated users to create their preferences
    - Add UPDATE policy for notification_preferences table to allow users to update their own preferences
    - Add SELECT policy for notification_preferences table to allow users to view their own preferences

  Note: These policies ensure users can only manage their own notification preferences
*/

-- Enable RLS on notification_preferences table if not already enabled
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy
CREATE POLICY "Users can create their own notification preferences"
ON notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update their own notification preferences"
ON notification_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy
CREATE POLICY "Users can view their own notification preferences"
ON notification_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);