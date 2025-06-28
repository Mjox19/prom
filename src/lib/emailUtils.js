import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Email templates
const templates = {
  'order-status-update': (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4B24, #d63e1f); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff7ed; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4B24; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
          <p>Your order has been updated</p>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>We wanted to update you on the status of your order.</p>
          
          <div class="order-details">
            <h3>Order #${data.orderNumber}</h3>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Amount:</strong> $${data.orderAmount?.toLocaleString()}</p>
            <p><strong>Previous Status:</strong> ${data.oldStatus}</p>
            <p><strong>New Status:</strong> 
              <span class="status-badge" style="background-color: ${data.statusColor};">
                ${data.newStatus}
              </span>
            </p>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
          </div>
          
          <p>${data.statusMessage}</p>
          
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <p>Thank you for your business!</p>
        </div>
        <div class="footer">
          <p>Promocups - Your Sales Management Solution</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  'delivery-reminder': (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Delivery Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4B24, #d63e1f); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff7ed; padding: 30px; border-radius: 0 0 8px 8px; }
        .delivery-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4B24; }
        .highlight { background: #ffedd5; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Delivery Reminder</h1>
          <p>Your order is arriving soon!</p>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          
          <div class="highlight">
            <h3>📦 Your order is scheduled for delivery on ${data.deliveryDate}</h3>
          </div>
          
          <div class="delivery-info">
            <h3>Delivery Details</h3>
            <p><strong>Order #:</strong> ${data.orderNumber}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Carrier:</strong> ${data.carrier}</p>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            <p><strong>Delivery Address:</strong><br>${data.shippingAddress}</p>
            <p><strong>Order Value:</strong> $${data.orderAmount?.toLocaleString()}</p>
          </div>
          
          <p><strong>Please ensure someone is available to receive your delivery.</strong></p>
          
          <p>If you need to reschedule or have any questions about your delivery, please contact us as soon as possible.</p>
          
          <p>Thank you for choosing us!</p>
        </div>
        <div class="footer">
          <p>Promocups - Your Sales Management Solution</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  'quote-email': (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote ${data.quoteNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4B24, #d63e1f); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff7ed; padding: 30px; border-radius: 0 0 8px 8px; }
        .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4B24; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #EF4B24; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Quote ${data.quoteNumber}</h1>
          <p>Your personalized quote is ready</p>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your interest in our services. Please find your quote details below:</p>
          
          <div class="quote-details">
            <h3>Quote Details</h3>
            <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Valid Until:</strong> ${data.validUntil}</p>
            <p><strong>Total Amount:</strong> $${data.totalAmount?.toLocaleString()}</p>
          </div>
          
          <p>${data.quoteDescription || 'Please review the attached quote document for detailed information.'}</p>
          
          <p>If you have any questions about this quote, please don't hesitate to contact us.</p>
          
          <p>Thank you for considering our services!</p>
        </div>
        <div class="footer">
          <p>Promocups - Your Sales Management Solution</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Email service functions
export const emailUtils = {
  // Get all email templates
  getTemplates() {
    return templates;
  },
  
  // Get a specific template
  getTemplate(templateName) {
    return templates[templateName];
  },
  
  // Render a template with data
  renderTemplate(templateName, data) {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    return template(data);
  },
  
  // Get email logs (in a real implementation, this would fetch from the database)
  async getEmailLogs() {
    // In a real implementation, this would fetch from the database
    // For now, we'll return an empty array
    return [];
  },
  
  // Save SMTP settings (in a real implementation, this would save to the database)
  async saveSmtpSettings(settings) {
    try {
      if (!isSupabaseConfigured) {
        console.log('Demo: Saving SMTP settings', settings);
        return { success: true };
      }
      
      // In a real implementation, this would save to the database
      // For now, we'll just log it
      console.log('Saving SMTP settings:', settings);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get SMTP settings (in a real implementation, this would fetch from the database)
  async getSmtpSettings() {
    try {
      if (!isSupabaseConfigured) {
        // Return demo settings
        return {
          host: 'localhost',
          port: 2525,
          secure: false,
          auth: false,
          username: '',
          password: '',
          from: 'sales@promocups.com',
          fromName: 'Promocups Sales'
        };
      }
      
      // In a real implementation, this would fetch from the database
      // For now, we'll return demo settings
      return {
        host: 'localhost',
        port: 2525,
        secure: false,
        auth: false,
        username: '',
        password: '',
        from: 'sales@promocups.com',
        fromName: 'Promocups Sales'
      };
    } catch (error) {
      console.error('Error getting SMTP settings:', error);
      throw error;
    }
  }
};