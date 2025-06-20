import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Notification service for handling order and delivery notifications
export class NotificationService {
  constructor() {
    this.isConfigured = isSupabaseConfigured;
  }

  // Create a notification in the database
  async createNotification(userId, title, message, type = 'system') {
    if (!this.isConfigured) {
      console.log('Demo notification:', { userId, title, message, type });
      return { success: true, demo: true };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type,
          read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/vite.svg',
          tag: `notification-${data.id}`
        });
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification via edge function
  async sendEmailNotification(emailData) {
    if (!this.isConfigured) {
      console.log('Demo email notification:', emailData);
      return { success: true, demo: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: emailData
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle order status change notifications
  async handleOrderStatusChange(order, oldStatus, newStatus, customer, user) {
    const statusMessages = {
      pending: 'Your order has been received and is pending processing',
      processing: 'Your order is now being processed',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'Your order has been cancelled'
    };

    const statusColors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };

    const customerMessage = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}`;
    const userMessage = `Order #${order.id.slice(0, 8)} status changed from ${oldStatus} to ${newStatus}`;

    // Create notification for the user
    await this.createNotification(
      user.id,
      'Order Status Updated',
      userMessage,
      'sale'
    );

    // Send email to customer
    const customerEmailData = {
      to: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      subject: `Order Update - Status Changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      template: 'order-status-update',
      data: {
        orderNumber: order.id.slice(0, 8),
        customerName: `${customer.first_name} ${customer.last_name}`,
        companyName: customer.company_name,
        oldStatus: oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1),
        newStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
        statusMessage: customerMessage,
        statusColor: statusColors[newStatus],
        orderAmount: order.total_amount,
        trackingNumber: order.tracking_number
      }
    };

    await this.sendEmailNotification(customerEmailData);

    return { success: true };
  }

  // Handle delivery reminder notifications (5 days ahead)
  async handleDeliveryReminder(delivery, order, customer, user) {
    const deliveryDate = new Date(delivery.estimated_delivery);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const userMessage = `Delivery reminder: Order #${order.id.slice(0, 8)} is scheduled for delivery on ${formattedDate}`;
    const customerMessage = `Your order is scheduled for delivery on ${formattedDate}. Please ensure someone is available to receive it.`;

    // Create notification for the user
    await this.createNotification(
      user.id,
      'Delivery Reminder',
      userMessage,
      'sale'
    );

    // Send email to customer
    const customerEmailData = {
      to: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      subject: `Delivery Reminder - Your Order Arrives ${formattedDate}`,
      template: 'delivery-reminder',
      data: {
        orderNumber: order.id.slice(0, 8),
        customerName: `${customer.first_name} ${customer.last_name}`,
        companyName: customer.company_name,
        deliveryDate: formattedDate,
        carrier: delivery.carrier.toUpperCase(),
        trackingNumber: order.tracking_number,
        shippingAddress: order.shipping_address,
        orderAmount: order.total_amount
      }
    };

    await this.sendEmailNotification(customerEmailData);

    return { success: true };
  }

  // Check for upcoming deliveries (run this daily)
  async checkUpcomingDeliveries() {
    if (!this.isConfigured) {
      console.log('Demo: Checking upcoming deliveries');
      return { success: true, demo: true };
    }

    try {
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      fiveDaysFromNow.setHours(0, 0, 0, 0);

      const sixDaysFromNow = new Date(fiveDaysFromNow);
      sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 1);

      // Get deliveries scheduled for 5 days from now
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order:orders(
            *,
            customer:customers(*),
            user:profiles(*)
          )
        `)
        .gte('estimated_delivery', fiveDaysFromNow.toISOString())
        .lt('estimated_delivery', sixDaysFromNow.toISOString())
        .in('status', ['pending', 'in_transit', 'out_for_delivery']);

      if (error) throw error;

      // Send reminders for each delivery
      for (const delivery of deliveries || []) {
        if (delivery.order && delivery.order.customer && delivery.order.user) {
          await this.handleDeliveryReminder(
            delivery,
            delivery.order,
            delivery.order.customer,
            delivery.order.user
          );
        }
      }

      return { success: true, count: deliveries?.length || 0 };
    } catch (error) {
      console.error('Error checking upcoming deliveries:', error);
      return { success: false, error: error.message };
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Auto-check for upcoming deliveries every hour
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  setInterval(() => {
    notificationService.checkUpcomingDeliveries();
  }, 60 * 60 * 1000); // Check every hour
}