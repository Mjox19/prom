// This file is kept for compatibility but is no longer used.
// Email sending is now handled by the local SMTP server.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
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

    // Log the email attempt
    console.log(`[DEPRECATED] Sending notification email via Edge Function:
      - Template: ${template}
      - To: ${to} (${customerName})
      - Subject: ${subject}
      - Data: ${JSON.stringify(data, null, 2)}
    `);

    // Return success response - actual email is now sent via local SMTP server
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification email request received. Using local SMTP server instead.`,
        emailId: `local_${Date.now()}`
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
        error: error.message || 'Unknown error',
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