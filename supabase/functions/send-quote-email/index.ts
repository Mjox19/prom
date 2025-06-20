import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      quoteNumber, 
      customerEmail, 
      customerName, 
      companyName,
      quoteTitle,
      quoteTotal,
      pdfBase64 
    } = await req.json();

    // Validate required fields
    if (!quoteNumber || !customerEmail || !customerName || !pdfBase64) {
      throw new Error('Missing required fields');
    }

    // Log the email attempt (in production, replace this with actual email service)
    console.log(`Sending quote email:
      - Quote: ${quoteNumber}
      - To: ${customerEmail} (${customerName})
      - Company: ${companyName}
      - Title: ${quoteTitle}
      - Total: $${quoteTotal}
      - PDF attached: ${pdfBase64.length > 0 ? 'Yes' : 'No'}
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
        to: [{ email: customerEmail, name: customerName }],
        subject: `Quote ${quoteNumber} from QuoteSales Pro`
      }],
      from: { email: 'noreply@yourdomain.com', name: 'QuoteSales Pro' },
      content: [{
        type: 'text/html',
        value: `
          <h2>Quote ${quoteNumber}</h2>
          <p>Dear ${customerName},</p>
          <p>Please find attached your quote for ${quoteTitle || 'your request'}.</p>
          <p><strong>Total Amount: $${quoteTotal}</strong></p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>QuoteSales Pro Team</p>
        `
      }],
      attachments: [{
        content: pdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
        filename: `quote-${quoteNumber}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Quote ${quoteNumber} email sent to ${customerEmail}`,
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