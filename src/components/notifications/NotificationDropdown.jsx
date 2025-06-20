import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Package, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, isSupabaseConfigured, subscribeToTable } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Only proceed if we have a valid authenticated user
    if (!user?.id) {
      return;
    }

    fetchNotifications();
    
    // Subscribe to notification changes if Supabase is configured
    const unsubscribe = subscribeToTable(
      'notifications',
      (payload) => {
        console.log('Notification change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
          if (!payload.new.read) {
            setUnreadCount(prev => prev + 1);
            // Show browser notification if enabled
            if (Notification.permission === 'granted') {
              new Notification(payload.new.title, {
                body: payload.new.message,
                icon: '/vite.svg'
              });
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          );
          // Update unread count if read status changed
          if (payload.old.read !== payload.new.read) {
            setUnreadCount(prev => payload.new.read ? prev - 1 : prev + 1);
          }
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          if (!payload.old.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      },
      `user_id=eq.${user.id}`
    );

    return unsubscribe;
  }, [user]);

  const fetchNotifications = async () => {
    // Don't attempt to fetch if there's no user
    if (!user?.id) {
      return;
    }

    if (!isSupabaseConfigured) {
      // Use demo notifications when Supabase is not configured
      const demoNotifications = [
        {
          id: '1',
          title: 'Welcome to QuoteSales Pro',
          message: 'Your account has been set up successfully. Start by creating your first quote!',
          type: 'system',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Demo Order Status Update',
          message: 'Demo order #12345 status changed from pending to processing',
          type: 'sale',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.read).length);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    if (!user?.id) return;

    if (!isSupabaseConfigured) {
      // Demo mode - just update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id); // Additional security check

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    if (!isSupabaseConfigured) {
      // Demo mode - just update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'order':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't render anything if there's no authenticated user
  if (!user?.id) {
    return null;
  }

  return (
    <div className="relative notification-dropdown">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 flex items-start justify-between ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="h-3 w-3 text-blue-500" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see order updates and delivery reminders here
                </p>
              </div>
            )}
          </div>
          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;