import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Email templates
const templates = {
  'order-status-update': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
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
          <p>QuoteSales Pro - Your Sales Management Solution</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  'delivery-reminder': (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Delivery Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
        .delivery-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .highlight { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0; }
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
          <p>QuoteSales Pro - Your Sales Management Solution</p>
        </div>
      </div>
    </body>
    </html>
  `
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      customerName, 
      subject, 
      template, 
      data 
    } = await req.json();

    // Validate required fields
    if (!to || !customerName || !subject || !template || !data) {
      throw new Error('Missing required fields');
    }

    // Get the email template
    const templateFunction = templates[template];
    if (!templateFunction) {
      throw new Error(`Template '${template}' not found`);
    }

    // Generate HTML content
    const htmlContent = templateFunction(data);

    // Log the email attempt (in production, replace this with actual email service)
    console.log(`Sending notification email:
      - Template: ${template}
      - To: ${to} (${customerName})
      - Subject: ${subject}
      - Data: ${JSON.stringify(data, null, 2)}
    `);

    // Here you would integrate with your email service provider
    // Examples:
    // - SendGrid: https://sendgrid.com/
    // - Mailgun: https://www.mailgun.com/
    // - Postmark: https://postmarkapp.com/
    // - AWS SES: https://aws.amazon.com/ses/
    
    // Example integration with SendGrid (commented out):
    /*
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    const emailData = {
      personalizations: [{
        to: [{ email: to, name: customerName }],
        subject: subject
      }],
      from: { email: 'noreply@yourdomain.com', name: 'QuoteSales Pro' },
      content: [{
        type: 'text/html',
        value: htmlContent
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }
    */

    // For now, we'll simulate a successful email send
    // In production, remove this simulation and use a real email service
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification email sent to ${to}`,
        template: template,
        // Note: This is a simulation. In production, you'd get a real response from your email service
        emailId: `sim_${Date.now()}`
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});