import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export const generateQuotePDF = (quote, customer) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.text('QUOTE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Quote #: ${quote.quote_number}`, margin, 40);
  doc.text(`Date: ${format(new Date(quote.createdAt), 'dd/MM/yyyy')}`, margin, 50);
  doc.text(`Valid Until: ${format(new Date(quote.validUntil), 'dd/MM/yyyy')}`, margin, 60);

  // Customer Details
  doc.setFontSize(14);
  doc.text('Customer Details', margin, 80);
  doc.setFontSize(12);
  doc.text(`${customer.name}`, margin, 90);
  doc.text(`${customer.email}`, margin, 100);
  doc.text(`${customer.phone}`, margin, 110);
  doc.text(`${customer.address}`, margin, 120);

  // Quote Items
  doc.setFontSize(14);
  doc.text('Items', margin, 140);
  doc.setFontSize(12);

  let yPos = 160;
  doc.text('Description', margin, yPos);
  doc.text('Qty', 120, yPos);
  doc.text('Price', 150, yPos);
  doc.text('Total', 180, yPos);

  yPos += 10;
  quote.items.forEach(item => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(item.description.substring(0, 40), margin, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(item.price.toFixed(2), 150, yPos);
    doc.text((item.quantity * item.price).toFixed(2), 180, yPos);
    yPos += 10;
  });

  yPos += 10;
  doc.text('Subtotal:', 150, yPos);
  doc.text(quote.subtotal.toFixed(2), 180, yPos);
  
  yPos += 10;
  doc.text('Tax:', 150, yPos);
  doc.text(quote.tax.toFixed(2), 180, yPos);
  
  yPos += 10;
  doc.text('Total:', 150, yPos);
  doc.text(quote.total.toFixed(2), 180, yPos);

  // Terms and conditions
  yPos += 20;
  doc.setFontSize(10);
  doc.text('Terms and Conditions:', margin, yPos);
  yPos += 10;
  doc.text('1. This quote is valid for 30 days from the date of issue.', margin, yPos);
  yPos += 10;
  doc.text('2. Payment terms: 50% upfront, 50% upon delivery.', margin, yPos);

  return doc;
};

export const emailQuote = async (quote, customer, pdfDoc) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-quote-email', {
      body: {
        quoteNumber: quote.quote_number,
        customerEmail: customer.email,
        customerName: customer.name,
        pdfBase64: pdfDoc.output('datauristring')
      }
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error sending quote email:', error);
    throw error;
  }
};