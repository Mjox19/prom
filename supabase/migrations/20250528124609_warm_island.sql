/*
  # Enable real-time notifications

  1. Changes
    - Enable real-time for notifications table
    - Enable real-time for notification_preferences table
    - Add publication for real-time changes
*/

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_preferences;

-- Enable real-time for specific columns
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE notification_preferences REPLICA IDENTITY FULL;