/*
  # Add test notifications

  1. New Tables
    - No new tables, using existing notifications table
  2. Changes
    - Add sample notifications for testing
*/

-- Insert some test notifications
INSERT INTO notifications (user_id, title, message, type, created_at)
SELECT 
  profiles.id,
  'Welcome to QuoteSales Pro',
  'Get started by creating your first quote or exploring the dashboard.',
  'news',
  now() - interval '2 days'
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE notifications.user_id = profiles.id 
  AND notifications.title = 'Welcome to QuoteSales Pro'
);

INSERT INTO notifications (user_id, title, message, type, created_at)
SELECT 
  profiles.id,
  'New Feature: Push Notifications',
  'Enable push notifications in settings to stay updated in real-time.',
  'system',
  now() - interval '1 day'
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE notifications.user_id = profiles.id 
  AND notifications.title = 'New Feature: Push Notifications'
);

INSERT INTO notifications (user_id, title, message, type, created_at)
SELECT 
  profiles.id,
  'Quote Tips',
  'Create professional quotes faster with our new templates.',
  'quote',
  now() - interval '12 hours'
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE notifications.user_id = profiles.id 
  AND notifications.title = 'Quote Tips'
);

INSERT INTO notifications (user_id, title, message, type, created_at)
SELECT 
  profiles.id,
  'Sales Milestone',
  'Congratulations on your first sale! Keep up the great work.',
  'sale',
  now() - interval '1 hour'
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notifications 
  WHERE notifications.user_id = profiles.id 
  AND notifications.title = 'Sales Milestone'
);