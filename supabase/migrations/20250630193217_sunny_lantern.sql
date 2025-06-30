/*
  # Add Notification Trigger for Realtime Updates

  1. Changes
    - Add trigger function to handle notification changes
    - Create trigger on notifications table for realtime updates
    - Enable realtime for notifications table
    
  2. Security
    - No changes to existing RLS policies
*/

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set replica identity for realtime
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Create a function to handle notification changes
CREATE OR REPLACE FUNCTION handle_notification_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This function is a hook for the notification system
  -- It doesn't need to do anything as the realtime system will handle the notification
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to fire when notifications are inserted or updated
CREATE TRIGGER on_notification_change
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW EXECUTE FUNCTION handle_notification_change();