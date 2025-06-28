// This file is kept for compatibility but is no longer used.
// Email sending is now handled by the local SMTP server.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
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

    // Log the email attempt
    console.log(`[DEPRECATED] Sending quote email via Edge Function:
      - Quote: ${quoteNumber}
      - To: ${customerEmail} (${customerName})
      - Company: ${companyName}
      - Title: ${quoteTitle}
      - Total: $${quoteTotal}
      - PDF attached: ${pdfBase64.length > 0 ? 'Yes' : 'No'}
    `);

    // Return success response - actual email is now sent via local SMTP server
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Quote ${quoteNumber} email request received. Using local SMTP server instead.`,
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