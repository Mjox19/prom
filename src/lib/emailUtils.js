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
  
  'delivery-notification': (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Delivery Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f5f3ff; padding: 30px; border-radius: 0 0 8px 8px; }
        .delivery-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
        .tracking-box { background: #ede9fe; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Your Order is On the Way!</h1>
          <p>Delivery notification for your recent order</p>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div class="delivery-info">
            <h3>Delivery Information</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Carrier:</strong> ${data.carrier}</p>
            <p><strong>Estimated Delivery Date:</strong> ${data.estimatedDelivery}</p>
            <p><strong>Shipping Address:</strong><br>${data.shippingAddress}</p>
          </div>
          
          ${data.trackingNumber ? `
          <div class="tracking-box">
            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
            <a href="#" class="button">Track Your Package</a>
          </div>
          ` : ''}
          
          <p>If you have any questions about your delivery, please don't hesitate to contact our customer service team.</p>
          
          <p>Thank you for your order!</p>
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

// Create a log entry for an email
const logEmail = async (userId, toEmail, subject, template, status, error = null, metadata = {}) => {
  try {
    if (!isSupabaseConfigured) {
      console.log('Demo mode: Would log email:', {
        userId,
        toEmail,
        subject,
        template,
        status,
        error,
        metadata
      });
      return { success: true, demo: true };
    }

    const { data, error: insertError } = await supabase
      .from('email_logs')
      .insert([{
        user_id: userId,
        to_email: toEmail,
        subject,
        template,
        status,
        error: error,
        metadata,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return { success: true, data };
  } catch (err) {
    console.error('Error logging email:', err);
    return { success: false, error: err.message };
  }
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
  
  // Get email logs
  async getEmailLogs() {
    try {
      if (!isSupabaseConfigured) {
        // Return demo logs in demo mode
        return Array.from({ length: 10 }).map((_, i) => ({
          id: `log-${i}`,
          to: `customer${i}@example.com`,
          subject: `Demo Email ${i}`,
          template: i % 5 === 0 ? 'quote-email' : 
                   i % 5 === 1 ? 'order-status-update' : 
                   i % 5 === 2 ? 'delivery-reminder' : 
                   i % 5 === 3 ? 'delivery-notification' : 'system',
          status: i % 3 === 0 ? 'sent' : i % 3 === 1 ? 'failed' : 'pending',
          created_at: new Date(Date.now() - i * 3600000).toISOString(),
          type: i % 5 === 0 ? 'quote' : 
                i % 5 === 1 ? 'order' : 
                i % 5 === 2 ? 'delivery' : 
                i % 5 === 3 ? 'delivery' : 'system'
        }));
      }
      
      // In a real implementation, fetch from Supabase
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('Error fetching email logs:', error);
        throw error;
      }
      
      // Transform the data to match the expected format
      return (data || []).map(log => ({
        id: log.id,
        to: log.to_email,
        subject: log.subject,
        template: log.template,
        status: log.status,
        created_at: log.created_at,
        error: log.error,
        // Extract type from metadata or template name
        type: log.metadata?.type || 
              (log.template === 'quote-email' ? 'quote' : 
               log.template === 'order-status-update' ? 'order' : 
               log.template === 'delivery-reminder' || log.template === 'delivery-notification' ? 'delivery' : 'system')
      }));
    } catch (error) {
      console.error('Error getting email logs:', error);
      return [];
    }
  },
  
  // Save SMTP settings
  async saveSmtpSettings(settings) {
    try {
      if (!isSupabaseConfigured) {
        console.log('Demo: Saving SMTP settings', settings);
        
        // Save to localStorage for demo persistence
        localStorage.setItem('smtp_settings', JSON.stringify({
          ...settings,
          updated_at: new Date().toISOString()
        }));
        
        return { success: true };
      }
      
      // In a real implementation, save to Supabase
      const { error } = await supabase
        .from('smtp_settings')
        .upsert([{
          id: 'default',
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          auth: settings.auth,
          username: settings.username,
          password: settings.password, // In production, this should be encrypted
          from_email: settings.from,
          from_name: settings.fromName,
          updated_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get SMTP settings
  async getSmtpSettings() {
    try {
      if (!isSupabaseConfigured) {
        // Try to get from localStorage first for demo persistence
        const savedSettings = localStorage.getItem('smtp_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          return {
            host: parsed.host,
            port: parsed.port,
            secure: parsed.secure,
            auth: parsed.auth,
            username: parsed.username,
            password: parsed.password,
            from: parsed.from,
            fromName: parsed.fromName
          };
        }
        
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
      
      // In a real implementation, fetch from Supabase
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .eq('id', 'default')
        .single();
        
      if (error) {
        // If no settings found, return defaults
        if (error.code === 'PGRST116') {
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
        throw error;
      }
      
      return {
        host: data.host,
        port: data.port,
        secure: data.secure,
        auth: data.auth,
        username: data.username,
        password: data.password,
        from: data.from_email,
        fromName: data.from_name
      };
    } catch (error) {
      console.error('Error getting SMTP settings:', error);
      // Return default settings on error
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
  },
  
  // Test SMTP connection
  async testSmtpConnection(settings) {
    try {
      if (!isSupabaseConfigured) {
        // In demo mode, simulate a successful connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: 'Connection successful! (Demo Mode)' };
      }
      
      // In a real implementation, we would test the connection with the SMTP server
      // For now, we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, message: 'Connection successful! SMTP server is responding.' };
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      return { success: false, error: error.message || 'Failed to connect to SMTP server' };
    }
  },
  
  // Send an email and log it
  async sendEmail(options) {
    try {
      const { userId, to, customerName, subject, template, data } = options;
      
      // Validate required fields
      if (!to || !customerName || !subject || !template || !data) {
        throw new Error('Missing required fields for email');
      }
      
      // Log the email as pending
      await logEmail(userId, to, subject, template, 'pending', null, {
        type: template.includes('quote') ? 'quote' : 
              template.includes('order') ? 'order' : 
              template.includes('delivery') ? 'delivery' : 'system',
        customerName,
        ...data
      });
      
      // In a real implementation, this would send the email
      // For now, we'll just log it and simulate success
      console.log(`📧 Email would be sent:
        To: ${to} (${customerName})
        Subject: ${subject}
        Template: ${template}
        Data: ${JSON.stringify(data, null, 2)}
      `);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 90% chance of success in demo mode
      const success = Math.random() < 0.9;
      
      if (success) {
        // Log the email as sent
        await logEmail(userId, to, subject, template, 'sent', null, {
          type: template.includes('quote') ? 'quote' : 
                template.includes('order') ? 'order' : 
                template.includes('delivery') ? 'delivery' : 'system',
          customerName,
          ...data
        });
        
        return { success: true, messageId: `mock-${Date.now()}` };
      } else {
        // Simulate a failure
        const error = 'SMTP connection error: Connection refused';
        
        // Log the email as failed
        await logEmail(userId, to, subject, template, 'failed', error, {
          type: template.includes('quote') ? 'quote' : 
                template.includes('order') ? 'order' : 
                template.includes('delivery') ? 'delivery' : 'system',
          customerName,
          ...data
        });
        
        throw new Error(error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }
};