import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create emails directory if it doesn't exist
const emailsDir = path.join(__dirname, '../../emails');
try {
  await fs.mkdir(emailsDir, { recursive: true });
  console.log(`Created emails directory at ${emailsDir}`);
} catch (err) {
  console.error('Error creating emails directory:', err);
}

// Create SMTP server
const server = new SMTPServer({
  secure: false,
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  maxAllowedUnauthenticatedCommands: 1000,
  
  // Handle incoming mail
  async onData(stream, session, callback) {
    try {
      // Parse email
      const parsed = await simpleParser(stream);
      
      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}-${parsed.subject?.replace(/[^a-z0-9]/gi, '-') || 'email'}.json`;
      const filepath = path.join(emailsDir, filename);
      
      // Save email data to file
      const emailData = {
        from: parsed.from?.text,
        to: parsed.to?.text,
        subject: parsed.subject,
        text: parsed.text,
        html: parsed.html,
        attachments: parsed.attachments?.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.size
        })),
        headers: parsed.headers,
        date: parsed.date,
        receivedAt: new Date().toISOString()
      };
      
      await fs.writeFile(filepath, JSON.stringify(emailData, null, 2));
      console.log(`Email saved to ${filepath}`);
      
      // Log email receipt
      console.log(`
========== NEW EMAIL RECEIVED ==========
From: ${parsed.from?.text}
To: ${parsed.to?.text}
Subject: ${parsed.subject}
Date: ${parsed.date}
=======================================
      `);
      
      callback();
    } catch (err) {
      console.error('Error processing email:', err);
      callback(new Error('Error processing email'));
    }
  }
});

// Start SMTP server
const PORT = 2525;
server.listen(PORT, () => {
  console.log(`SMTP Server running on port ${PORT}`);
  console.log(`Emails will be saved to ${emailsDir}`);
});

// Create a test email sender
const createTestEmailSender = () => {
  // Create a nodemailer transport that connects to our local SMTP server
  const transport = nodemailer.createTransport({
    host: 'localhost',
    port: PORT,
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });
  
  return {
    sendTestEmail: async () => {
      try {
        const info = await transport.sendMail({
          from: 'test@promocups.com',
          to: 'customer@example.com',
          subject: 'Test Email from Promocups',
          text: 'This is a test email from the Promocups SMTP server',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #EF4B24;">Promocups Email Test</h2>
              <p>This is a test email from the Promocups SMTP server.</p>
              <p>If you're seeing this, the email server is working correctly!</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <p style="margin: 0; color: #666;">This email was sent at: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        });
        
        console.log('Test email sent:', info);
        return info;
      } catch (error) {
        console.error('Error sending test email:', error);
        throw error;
      }
    }
  };
};

// Send a test email after 3 seconds to verify the server is working
setTimeout(async () => {
  const emailSender = createTestEmailSender();
  try {
    await emailSender.sendTestEmail();
    console.log('✅ Test email sent successfully');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
  }
}, 3000);

// Export the email sender for use in other parts of the application
export const emailSender = createTestEmailSender();

// Keep the process running
console.log('Email server started. Press Ctrl+C to stop.');