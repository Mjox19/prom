import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { notificationService } from '@/lib/notificationService';

// Delivery scheduler for checking upcoming deliveries and sending reminders
export class DeliveryScheduler {
  constructor() {
    this.isConfigured = isSupabaseConfigured;
    this.intervalId = null;
  }

  // Start the scheduler to check for upcoming deliveries
  start() {
    if (this.intervalId) {
      this.stop();
    }

    // Check immediately
    this.checkUpcomingDeliveries();

    // Then check every hour
    this.intervalId = setInterval(() => {
      this.checkUpcomingDeliveries();
    }, 60 * 60 * 1000); // 1 hour

    console.log('Delivery scheduler started');
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Delivery scheduler stopped');
    }
  }

  // Check for deliveries that are 5 days away
  async checkUpcomingDeliveries() {
    if (!this.isConfigured) {
      console.log('Demo mode: Checking upcoming deliveries');
      return;
    }

    try {
      const now = new Date();
      const fiveDaysFromNow = new Date(now);
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      fiveDaysFromNow.setHours(0, 0, 0, 0);

      const sixDaysFromNow = new Date(fiveDaysFromNow);
      sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 1);

      // Get deliveries scheduled for exactly 5 days from now
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          order:orders(
            *,
            customer:customers(*)
          )
        `)
        .gte('estimated_delivery', fiveDaysFromNow.toISOString())
        .lt('estimated_delivery', sixDaysFromNow.toISOString())
        .in('status', ['pending', 'in_transit', 'out_for_delivery']);

      if (error) {
        console.error('Error fetching upcoming deliveries:', error);
        return;
      }

      console.log(`Found ${deliveries?.length || 0} deliveries for 5 days from now`);

      // Send reminders for each delivery
      for (const delivery of deliveries || []) {
        if (delivery.order && delivery.order.customer && delivery.order.user_id) {
          try {
            // Fetch the user profile separately
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, first_name, last_name')
              .eq('id', delivery.order.user_id)
              .single();

            if (profileError) {
              console.error(`Error fetching user profile for order ${delivery.order.id}:`, profileError);
              continue;
            }

            await notificationService.handleDeliveryReminder(
              delivery,
              delivery.order,
              delivery.order.customer,
              userProfile
            );
            
            console.log(`Delivery reminder sent for order ${delivery.order.id}`);
          } catch (error) {
            console.error(`Error sending reminder for order ${delivery.order.id}:`, error);
          }
        }
      }

      return deliveries?.length || 0;
    } catch (error) {
      console.error('Error in delivery scheduler:', error);
      return 0;
    }
  }

  // Manual trigger for testing
  async triggerCheck() {
    console.log('Manually triggering delivery check...');
    const count = await this.checkUpcomingDeliveries();
    console.log(`Processed ${count} upcoming deliveries`);
    return count;
  }
}

// Create singleton instance
export const deliveryScheduler = new DeliveryScheduler();

// Auto-start the scheduler when the module loads (only in browser environment)
if (typeof window !== 'undefined') {
  // Start after a short delay to ensure everything is initialized
  setTimeout(() => {
    deliveryScheduler.start();
  }, 5000);

  // // Stop the scheduler when the page is about to unload
  // window.addEventListener('beforeunload', () => {
  //   deliveryScheduler.stop();
  // });
}