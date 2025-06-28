import nodemailer from 'nodemailer';

// Create a nodemailer transport that connects to our local SMTP server
const transport = nodemailer.createTransport({
  host: 'localhost',
  port: 2525,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

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
const emailService = {
  /**
   * Send an email using a template
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.customerName - Customer name
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name (must exist in templates)
   * @param {Object} options.data - Data to populate the template
   * @param {Buffer|string} [options.attachment] - Optional attachment (PDF, etc.)
   * @param {string} [options.attachmentFilename] - Attachment filename
   * @returns {Promise<Object>} - Send result
   */
  sendTemplatedEmail: async (options) => {
    try {
      const { to, customerName, subject, template, data, attachment, attachmentFilename } = options;
      
      // Validate required fields
      if (!to || !customerName || !subject || !template || !data) {
        throw new Error('Missing required fields for email');
      }
      
      // Get the template function
      const templateFunction = templates[template];
      if (!templateFunction) {
        throw new Error(`Template '${template}' not found`);
      }
      
      // Generate HTML content
      const htmlContent = templateFunction(data);
      
      // Prepare email data
      const mailOptions = {
        from: '"Promocups Sales" <sales@promocups.com>',
        to: `"${customerName}" <${to}>`,
        subject,
        text: `This is an HTML email. Please use an HTML-compatible email client to view it properly.`,
        html: htmlContent
      };
      
      // Add attachment if provided
      if (attachment) {
        mailOptions.attachments = [{
          filename: attachmentFilename || 'document.pdf',
          content: attachment,
          contentType: 'application/pdf'
        }];
      }
      
      // Send the email
      const info = await transport.sendMail(mailOptions);
      
      console.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  },
  
  /**
   * Send an order status update email
   */
  sendOrderStatusUpdate: async (options) => {
    return emailService.sendTemplatedEmail({
      ...options,
      template: 'order-status-update'
    });
  },
  
  /**
   * Send a delivery reminder email
   */
  sendDeliveryReminder: async (options) => {
    return emailService.sendTemplatedEmail({
      ...options,
      template: 'delivery-reminder'
    });
  },
  
  /**
   * Send a quote email with PDF attachment
   */
  sendQuoteEmail: async (options) => {
    return emailService.sendTemplatedEmail({
      ...options,
      template: 'quote-email'
    });
  }
};

export default emailService;