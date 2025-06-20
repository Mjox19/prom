import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export const generateQuotePDF = (quote, customer) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text('QUOTE', pageWidth / 2, 20, { align: 'center' });
  
  // Company info (you can customize this)
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('QuoteSales Pro', margin, 40);
  doc.text('Your Sales Management Solution', margin, 50);
  
  // Quote details
  doc.setFontSize(12);
  doc.text(`Quote #: ${quote.quote_number || quote.id.slice(0, 8)}`, margin, 70);
  doc.text(`Date: ${format(new Date(quote.created_at), 'dd/MM/yyyy')}`, margin, 80);
  if (quote.valid_until) {
    doc.text(`Valid Until: ${format(new Date(quote.valid_until), 'dd/MM/yyyy')}`, margin, 90);
  }

  // Customer Details
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text('Bill To:', margin, 110);
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`${customer.company_name}`, margin, 125);
  doc.text(`${customer.first_name} ${customer.last_name}`, margin, 135);
  doc.text(`${customer.email}`, margin, 145);
  if (customer.phone) {
    doc.text(`${customer.phone}`, margin, 155);
  }
  if (customer.address) {
    // Split long addresses into multiple lines
    const addressLines = doc.splitTextToSize(customer.address, 80);
    let yPos = 165;
    addressLines.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 10;
    });
  }

  // Quote title and description
  let currentY = 185;
  if (quote.title) {
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Quote Title:', margin, currentY);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    currentY += 15;
    doc.text(quote.title, margin, currentY);
    currentY += 15;
  }

  if (quote.description) {
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text('Description:', margin, currentY);
    doc.setTextColor(0, 0, 0);
    currentY += 15;
    const descLines = doc.splitTextToSize(quote.description, pageWidth - 2 * margin);
    descLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += 10;
    });
    currentY += 10;
  }

  // Quote Items (if available)
  if (quote.items && quote.items.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Items', margin, currentY);
    currentY += 15;

    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Description', margin, currentY);
    doc.text('Qty', 120, currentY);
    doc.text('Price', 150, currentY);
    doc.text('Total', 180, currentY);
    currentY += 10;

    // Draw line under headers
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    currentY += 5;

    quote.items.forEach(item => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(item.description.substring(0, 40), margin, currentY);
      doc.text(item.quantity.toString(), 120, currentY);
      doc.text(`$${item.price.toFixed(2)}`, 150, currentY);
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 180, currentY);
      currentY += 10;
    });
  }

  // Totals
  currentY += 15;
  doc.setFontSize(12);
  doc.text('Subtotal:', 150, currentY);
  doc.text(`$${quote.subtotal?.toFixed(2) || '0.00'}`, 180, currentY);
  
  currentY += 10;
  doc.text('Tax:', 150, currentY);
  doc.text(`$${quote.tax?.toFixed(2) || '0.00'}`, 180, currentY);
  
  currentY += 10;
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text('Total:', 150, currentY);
  doc.text(`$${quote.total?.toFixed(2) || '0.00'}`, 180, currentY);

  // Terms and conditions
  currentY += 25;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Terms and Conditions:', margin, currentY);
  currentY += 10;
  doc.text('1. This quote is valid for the period specified above.', margin, currentY);
  currentY += 8;
  doc.text('2. Payment terms: 50% upfront, 50% upon delivery.', margin, currentY);
  currentY += 8;
  doc.text('3. Prices are subject to change without notice.', margin, currentY);
  currentY += 8;
  doc.text('4. All work will be completed according to specifications.', margin, currentY);

  // Footer
  currentY += 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, currentY, { align: 'center' });

  return doc;
};

export const emailQuote = async (quote, customer, pdfDoc) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = pdfDoc.output('datauristring');
    
    const { data, error } = await supabase.functions.invoke('send-quote-email', {
      body: {
        quoteNumber: quote.quote_number || quote.id.slice(0, 8),
        customerEmail: customer.email,
        customerName: `${customer.first_name} ${customer.last_name}`,
        companyName: customer.company_name,
        quoteTitle: quote.title,
        quoteTotal: quote.total,
        pdfBase64: pdfBase64
      }
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error sending quote email:', error);
    throw error;
  }
};