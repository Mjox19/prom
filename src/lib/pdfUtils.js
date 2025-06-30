import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { emailUtils } from '@/lib/emailUtils';

// Language translations for PDF documents
const translations = {
  english: {
    quote: 'QUOTE',
    billTo: 'Bill To:',
    quoteTitle: 'Quote Title:',
    description: 'Description:',
    items: 'Items',
    description: 'Description',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal:',
    tax: 'Tax:',
    termsAndConditions: 'Terms and Conditions:',
    term1: '1. This quote is valid for the period specified above.',
    term2: '2. Payment terms: 50% upfront, 50% upon delivery.',
    term3: '3. Prices are subject to change without notice.',
    term4: '4. All work will be completed according to specifications.',
    thankYou: 'Thank you for your business!',
    validUntil: 'Valid Until:',
    date: 'Date:',
    quoteNumber: 'Quote #:',
    order: 'ORDER',
    orderNumber: 'Order #:',
    orderDate: 'Order Date:',
    shippingAddress: 'Shipping Address:',
    orderStatus: 'Order Status:',
    paymentStatus: 'Payment Status:',
    trackingNumber: 'Tracking Number:',
    estimatedDelivery: 'Estimated Delivery:',
    carrier: 'Carrier:',
    deliveryTitle: 'Delivery Information:'
  },
  french: {
    quote: 'DEVIS',
    billTo: 'Facturer à:',
    quoteTitle: 'Titre du devis:',
    description: 'Description:',
    items: 'Articles',
    description: 'Description',
    qty: 'Qté',
    price: 'Prix',
    total: 'Total',
    subtotal: 'Sous-total:',
    tax: 'TVA:',
    termsAndConditions: 'Termes et conditions:',
    term1: '1. Ce devis est valable pour la période spécifiée ci-dessus.',
    term2: '2. Conditions de paiement: 50% à l\'avance, 50% à la livraison.',
    term3: '3. Les prix sont susceptibles de changer sans préavis.',
    term4: '4. Tous les travaux seront réalisés selon les spécifications.',
    thankYou: 'Merci pour votre confiance!',
    validUntil: 'Valable jusqu\'au:',
    date: 'Date:',
    quoteNumber: 'Devis n°:',
    order: 'COMMANDE',
    orderNumber: 'Commande n°:',
    orderDate: 'Date de commande:',
    shippingAddress: 'Adresse de livraison:',
    orderStatus: 'Statut de la commande:',
    paymentStatus: 'Statut du paiement:',
    trackingNumber: 'Numéro de suivi:',
    estimatedDelivery: 'Livraison estimée:',
    carrier: 'Transporteur:',
    deliveryTitle: 'Informations de livraison:'
  },
  spanish: {
    quote: 'PRESUPUESTO',
    billTo: 'Facturar a:',
    quoteTitle: 'Título del presupuesto:',
    description: 'Descripción:',
    items: 'Artículos',
    description: 'Descripción',
    qty: 'Cant.',
    price: 'Precio',
    total: 'Total',
    subtotal: 'Subtotal:',
    tax: 'Impuesto:',
    termsAndConditions: 'Términos y condiciones:',
    term1: '1. Este presupuesto es válido por el período especificado anteriormente.',
    term2: '2. Condiciones de pago: 50% por adelantado, 50% a la entrega.',
    term3: '3. Los precios están sujetos a cambios sin previo aviso.',
    term4: '4. Todo el trabajo se completará de acuerdo con las especificaciones.',
    thankYou: '¡Gracias por su negocio!',
    validUntil: 'Válido hasta:',
    date: 'Fecha:',
    quoteNumber: 'Presupuesto n°:',
    order: 'PEDIDO',
    orderNumber: 'Pedido n°:',
    orderDate: 'Fecha del pedido:',
    shippingAddress: 'Dirección de envío:',
    orderStatus: 'Estado del pedido:',
    paymentStatus: 'Estado del pago:',
    trackingNumber: 'Número de seguimiento:',
    estimatedDelivery: 'Entrega estimada:',
    carrier: 'Transportista:',
    deliveryTitle: 'Información de entrega:'
  },
  dutch: {
    quote: 'OFFERTE',
    billTo: 'Factureren aan:',
    quoteTitle: 'Offerte titel:',
    description: 'Beschrijving:',
    items: 'Artikelen',
    description: 'Beschrijving',
    qty: 'Aantal',
    price: 'Prijs',
    total: 'Totaal',
    subtotal: 'Subtotaal:',
    tax: 'BTW:',
    termsAndConditions: 'Algemene voorwaarden:',
    term1: '1. Deze offerte is geldig voor de hierboven aangegeven periode.',
    term2: '2. Betalingsvoorwaarden: 50% vooraf, 50% bij levering.',
    term3: '3. Prijzen kunnen zonder voorafgaande kennisgeving worden gewijzigd.',
    term4: '4. Alle werkzaamheden worden volgens specificaties uitgevoerd.',
    thankYou: 'Bedankt voor uw vertrouwen!',
    validUntil: 'Geldig tot:',
    date: 'Datum:',
    quoteNumber: 'Offerte nr.:',
    order: 'BESTELLING',
    orderNumber: 'Bestelling nr.:',
    orderDate: 'Besteldatum:',
    shippingAddress: 'Verzendadres:',
    orderStatus: 'Bestelstatus:',
    paymentStatus: 'Betalingsstatus:',
    trackingNumber: 'Trackingnummer:',
    estimatedDelivery: 'Geschatte levering:',
    carrier: 'Vervoerder:',
    deliveryTitle: 'Leveringsinformatie:'
  }
};

// Get translations based on customer language
const getTranslations = (customer) => {
  const language = customer?.contact_language || 'english';
  return translations[language] || translations.english;
};

// Format currency based on language
const formatCurrency = (amount, language = 'english') => {
  switch (language) {
    case 'french':
      return `${amount.toFixed(2).replace('.', ',')} €`;
    case 'spanish':
      return `${amount.toFixed(2).replace('.', ',')} €`;
    case 'dutch':
      return `€ ${amount.toFixed(2).replace('.', ',')}`;
    default:
      return `$${amount.toFixed(2)}`;
  }
};

// Translate status based on language
const translateStatus = (status, language = 'english') => {
  const statusTranslations = {
    english: {
      draft: 'Draft',
      sent: 'Sent',
      accepted: 'Accepted',
      declined: 'Declined',
      expired: 'Expired',
      ordered: 'Ordered',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      unpaid: 'Unpaid',
      half_paid: 'Half Paid',
      fully_paid: 'Fully Paid'
    },
    french: {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      declined: 'Refusé',
      expired: 'Expiré',
      ordered: 'Commandé',
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé',
      unpaid: 'Non payé',
      half_paid: 'Partiellement payé',
      fully_paid: 'Entièrement payé'
    },
    spanish: {
      draft: 'Borrador',
      sent: 'Enviado',
      accepted: 'Aceptado',
      declined: 'Rechazado',
      expired: 'Expirado',
      ordered: 'Pedido',
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      unpaid: 'No pagado',
      half_paid: 'Pagado parcialmente',
      fully_paid: 'Pagado completamente'
    },
    dutch: {
      draft: 'Concept',
      sent: 'Verzonden',
      accepted: 'Geaccepteerd',
      declined: 'Afgewezen',
      expired: 'Verlopen',
      ordered: 'Besteld',
      pending: 'In afwachting',
      processing: 'In behandeling',
      shipped: 'Verzonden',
      delivered: 'Geleverd',
      cancelled: 'Geannuleerd',
      unpaid: 'Onbetaald',
      half_paid: 'Gedeeltelijk betaald',
      fully_paid: 'Volledig betaald'
    }
  };
  
  return statusTranslations[language]?.[status] || status;
};

// Get PDF templates from localStorage
const getPdfTemplates = () => {
  try {
    const savedTemplates = localStorage.getItem('pdf_templates');
    if (savedTemplates) {
      return JSON.parse(savedTemplates);
    }
  } catch (error) {
    console.error('Error loading PDF templates:', error);
  }
  
  // Default templates if none found
  return {
    quote: {
      name: "Quote PDF Template",
      language: "english",
      header: {
        title: "QUOTE",
        companyInfo: "Promocups\nYour Sales Management Solution",
        showLogo: true
      },
      content: {
        customerTitle: "Bill To:",
        quoteTitle: "Quote Title:",
        descriptionTitle: "Description:",
        itemsTitle: "Items",
        itemsColumns: ["Description", "Qty", "Price", "Total"],
        subtotalLabel: "Subtotal:",
        taxLabel: "Tax:",
        totalLabel: "Total:",
        termsTitle: "Terms and Conditions:",
        terms: [
          "1. This quote is valid for the period specified above.",
          "2. Payment terms: 50% upfront, 50% upon delivery.",
          "3. Prices are subject to change without notice.",
          "4. All work will be completed according to specifications."
        ],
        footerText: "Thank you for your business!"
      },
      colors: {
        primary: "#4f46e5",
        secondary: "#f9fafb",
        text: "#333333",
        headerText: "#ffffff"
      },
      fonts: {
        main: "Arial",
        size: "normal"
      }
    },
    order: {
      name: "Order PDF Template",
      language: "english",
      header: {
        title: "ORDER",
        companyInfo: "Promocups\nYour Sales Management Solution",
        showLogo: true
      },
      content: {
        customerTitle: "Bill To:",
        shippingTitle: "Shipping Address:",
        orderTitle: "Order Information:",
        statusTitle: "Order Status:",
        paymentTitle: "Payment Status:",
        trackingTitle: "Tracking Information:",
        deliveryTitle: "Delivery Information:",
        itemsTitle: "Items",
        itemsColumns: ["Description", "Qty", "Price", "Total"],
        subtotalLabel: "Subtotal:",
        taxLabel: "Tax:",
        totalLabel: "Total:",
        footerText: "Thank you for your business!"
      },
      colors: {
        primary: "#EF4B24",
        secondary: "#fff7ed",
        text: "#333333",
        headerText: "#ffffff"
      },
      fonts: {
        main: "Arial",
        size: "normal"
      }
    }
  };
};

export const generateQuotePDF = (quote, customer) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Get language-specific translations
  const language = customer?.contact_language || 'english';
  const t = getTranslations(customer);
  
  // Get template settings
  const templates = getPdfTemplates();
  const template = templates.quote;
  
  // Set font based on template
  doc.setFont(template.fonts.main || 'Arial');
  
  // Set font size based on template
  let baseFontSize = 12;
  if (template.fonts.size === 'small') baseFontSize = 10;
  if (template.fonts.size === 'large') baseFontSize = 14;
  
  // Header
  doc.setFillColor(template.colors.primary || '#4f46e5');
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(template.colors.headerText || '#ffffff');
  doc.setFontSize(baseFontSize + 8);
  doc.setFont(template.fonts.main || 'Arial', 'bold');
  doc.text(template.header.title || t.quote, pageWidth / 2, 20, { align: 'center' });
  
  // Company info
  doc.setFontSize(baseFontSize);
  doc.setFont(template.fonts.main || 'Arial', 'normal');
  const companyInfoLines = (template.header.companyInfo || 'Promocups\nYour Sales Management Solution').split('\n');
  let yPos = 30;
  companyInfoLines.forEach(line => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
  });
  
  // Reset text color for body
  doc.setTextColor(template.colors.text || '#333333');
  
  // Quote details
  doc.setFontSize(baseFontSize);
  doc.text(`${t.quoteNumber} ${quote.quote_number || quote.id.slice(0, 8)}`, margin, 70);
  doc.text(`${t.date} ${format(new Date(quote.created_at), 'dd/MM/yyyy')}`, margin, 80);
  if (quote.valid_until) {
    doc.text(`${t.validUntil} ${format(new Date(quote.valid_until), 'dd/MM/yyyy')}`, margin, 90);
  }

  // Customer Details
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#4f46e5');
  doc.text(template.content.customerTitle || t.billTo, margin, 110);
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  doc.text(`${customer.company_name}`, margin, 125);
  doc.text(`${customer.first_name} ${customer.last_name}`, margin, 135);
  doc.text(`${customer.email}`, margin, 145);
  if (customer.phone) {
    doc.text(`${customer.phone}`, margin, 155);
  }
  if (customer.address) {
    // Split long addresses into multiple lines
    const addressLines = doc.splitTextToSize(customer.address, 80);
    let addressYPos = 165;
    addressLines.forEach(line => {
      doc.text(line, margin, addressYPos);
      addressYPos += 10;
    });
  }

  // Quote title and description
  let currentY = 185;
  if (quote.title) {
    doc.setFontSize(baseFontSize + 2);
    doc.setTextColor(template.colors.primary || '#4f46e5');
    doc.text(template.content.quoteTitle || t.quoteTitle, margin, currentY);
    doc.setFontSize(baseFontSize);
    doc.setTextColor(template.colors.text || '#333333');
    currentY += 15;
    doc.text(quote.title, margin, currentY);
    currentY += 15;
  }

  if (quote.description) {
    doc.setFontSize(baseFontSize + 2);
    doc.setTextColor(template.colors.primary || '#4f46e5');
    doc.text(template.content.descriptionTitle || t.description, margin, currentY);
    doc.setTextColor(template.colors.text || '#333333');
    currentY += 15;
    const descLines = doc.splitTextToSize(quote.description, pageWidth - 2 * margin);
    doc.setFontSize(baseFontSize);
    descLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += 10;
    });
    currentY += 10;
  }

  // Quote Items (if available)
  if (quote.items && quote.items.length > 0) {
    doc.setFontSize(baseFontSize + 2);
    doc.setTextColor(template.colors.primary || '#4f46e5');
    doc.text(template.content.itemsTitle || t.items, margin, currentY);
    currentY += 15;

    // Table headers
    doc.setFontSize(baseFontSize - 2);
    doc.setTextColor(template.colors.text || '#333333');
    
    // Use template columns or defaults
    const columns = template.content.itemsColumns || [t.description, t.qty, t.price, t.total];
    const colWidths = [100, 20, 30, 30]; // Adjust based on your needs
    let xPos = margin;
    
    columns.forEach((col, index) => {
      doc.text(col, xPos, currentY);
      xPos += colWidths[index];
    });
    
    currentY += 10;

    // Draw line under headers
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    currentY += 5;

    quote.items.forEach(item => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      xPos = margin;
      doc.text(item.description.substring(0, 40), xPos, currentY);
      xPos += colWidths[0];
      
      doc.text(item.quantity.toString(), xPos, currentY);
      xPos += colWidths[1];
      
      doc.text(formatCurrency(item.price, language), xPos, currentY);
      xPos += colWidths[2];
      
      doc.text(formatCurrency(item.quantity * item.price, language), xPos, currentY);
      
      currentY += 10;
    });
  }

  // Totals
  currentY += 15;
  doc.setFontSize(baseFontSize);
  doc.text(template.content.subtotalLabel || t.subtotal, 150, currentY);
  doc.text(formatCurrency(quote.subtotal || 0, language), 180, currentY);
  
  currentY += 10;
  doc.text(template.content.taxLabel || t.tax, 150, currentY);
  doc.text(formatCurrency(quote.tax || 0, language), 180, currentY);
  
  currentY += 10;
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#4f46e5');
  doc.text(template.content.totalLabel || t.total, 150, currentY);
  doc.text(formatCurrency(quote.total || 0, language), 180, currentY);

  // Terms and conditions
  currentY += 25;
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  doc.text(template.content.termsTitle || t.termsAndConditions, margin, currentY);
  currentY += 10;
  
  // Use template terms or defaults
  const terms = template.content.terms || [t.term1, t.term2, t.term3, t.term4];
  terms.forEach(term => {
    doc.text(term, margin, currentY);
    currentY += 8;
  });

  // Footer
  currentY += 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(template.content.footerText || t.thankYou, pageWidth / 2, currentY, { align: 'center' });

  return doc;
};

export const generateOrderPDF = (order, customer) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Get language-specific translations
  const language = customer?.contact_language || 'english';
  const t = getTranslations(customer);
  
  // Get template settings
  const templates = getPdfTemplates();
  const template = templates.order;
  
  // Set font based on template
  doc.setFont(template.fonts.main || 'Arial');
  
  // Set font size based on template
  let baseFontSize = 12;
  if (template.fonts.size === 'small') baseFontSize = 10;
  if (template.fonts.size === 'large') baseFontSize = 14;
  
  // Header
  doc.setFillColor(template.colors.primary || '#EF4B24');
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(template.colors.headerText || '#ffffff');
  doc.setFontSize(baseFontSize + 8);
  doc.setFont(template.fonts.main || 'Arial', 'bold');
  doc.text(template.header.title || t.order, pageWidth / 2, 20, { align: 'center' });
  
  // Company info
  doc.setFontSize(baseFontSize);
  doc.setFont(template.fonts.main || 'Arial', 'normal');
  const companyInfoLines = (template.header.companyInfo || 'Promocups\nYour Sales Management Solution').split('\n');
  let yPos = 30;
  companyInfoLines.forEach(line => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
  });
  
  // Reset text color for body
  doc.setTextColor(template.colors.text || '#333333');
  
  // Order details
  doc.setFontSize(baseFontSize);
  doc.text(`${t.orderNumber} ${order.quote_number || order.id.slice(0, 8)}`, margin, 70);
  doc.text(`${t.orderDate} ${format(new Date(order.created_at), 'dd/MM/yyyy')}`, margin, 80);
  
  // Customer Details
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.customerTitle || t.billTo, margin, 100);
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  doc.text(`${customer.company_name}`, margin, 115);
  doc.text(`${customer.first_name} ${customer.last_name}`, margin, 125);
  doc.text(`${customer.email}`, margin, 135);
  if (customer.phone) {
    doc.text(`${customer.phone}`, margin, 145);
  }

  // Shipping Address
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.shippingTitle || t.shippingAddress, margin, 165);
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  
  if (order.shipping_address) {
    // Split long addresses into multiple lines
    const addressLines = doc.splitTextToSize(order.shipping_address, 80);
    let addressYPos = 180;
    addressLines.forEach(line => {
      doc.text(line, margin, addressYPos);
      addressYPos += 10;
    });
  }

  // Order Status
  let currentY = 210;
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.statusTitle || t.orderStatus, margin, currentY);
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  currentY += 10;
  doc.text(translateStatus(order.status, language), margin, currentY);
  
  // Payment Status
  currentY += 15;
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.paymentTitle || t.paymentStatus, margin, currentY);
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  currentY += 10;
  doc.text(translateStatus(order.payment_status, language), margin, currentY);
  
  // Tracking Information
  if (order.tracking_number) {
    currentY += 15;
    doc.setFontSize(baseFontSize + 2);
    doc.setTextColor(template.colors.primary || '#EF4B24');
    doc.text(template.content.trackingTitle || t.trackingNumber, margin, currentY);
    doc.setFontSize(baseFontSize);
    doc.setTextColor(template.colors.text || '#333333');
    currentY += 10;
    doc.text(order.tracking_number, margin, currentY);
  }
  
  // Delivery Information
  if (order.delivery && order.delivery.length > 0) {
    const delivery = order.delivery[0];
    
    currentY += 15;
    doc.setFontSize(baseFontSize + 2);
    doc.setTextColor(template.colors.primary || '#EF4B24');
    doc.text(template.content.deliveryTitle || t.deliveryTitle, margin, currentY);
    doc.setFontSize(baseFontSize);
    doc.setTextColor(template.colors.text || '#333333');
    currentY += 10;
    doc.text(delivery.carrier?.toUpperCase() || 'N/A', margin, currentY);
    
    if (delivery.estimated_delivery) {
      currentY += 15;
      doc.setFontSize(baseFontSize + 2);
      doc.setTextColor(template.colors.primary || '#EF4B24');
      doc.text(t.estimatedDelivery, margin, currentY);
      doc.setFontSize(baseFontSize);
      doc.setTextColor(template.colors.text || '#333333');
      currentY += 10;
      doc.text(format(new Date(delivery.estimated_delivery), 'dd/MM/yyyy'), margin, currentY);
    }
  }

  // Add a new page for items
  doc.addPage();
  currentY = 20;
  
  // Order Items
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.itemsTitle || t.items, margin, currentY);
  currentY += 15;

  // Table headers
  doc.setFontSize(baseFontSize);
  doc.setTextColor(template.colors.text || '#333333');
  
  // Use template columns or defaults
  const columns = template.content.itemsColumns || [t.description, t.qty, t.price, t.total];
  
  // Define column widths and positions
  const colWidths = [
    pageWidth * 0.45 - margin, // Description (45% of page width)
    pageWidth * 0.15,          // Qty (15% of page width)
    pageWidth * 0.15,          // Price (15% of page width)
    pageWidth * 0.15           // Total (15% of page width)
  ];
  
  const colPositions = [
    margin,                                // Description starts at left margin
    margin + colWidths[0],                 // Qty
    margin + colWidths[0] + colWidths[1],  // Price
    margin + colWidths[0] + colWidths[1] + colWidths[2]  // Total
  ];
  
  // Draw table headers
  columns.forEach((col, index) => {
    const alignment = index === 0 ? 'left' : 'right';
    const xPos = index === 0 ? colPositions[index] : colPositions[index] + colWidths[index] - 5;
    doc.text(col, xPos, currentY, { align: alignment });
  });
  
  currentY += 10;

  // Draw line under headers
  doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
  currentY += 5;

  // Order items
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      const description = item.product_name || item.product_description || 'Item';
      const quantity = item.quantity || 0;
      const unitPrice = item.unit_price || 0;
      const totalPrice = item.total_price || (quantity * unitPrice);
      
      // Description (left-aligned)
      doc.text(description.substring(0, 40), colPositions[0], currentY);
      
      // Quantity (right-aligned)
      doc.text(quantity.toString(), colPositions[1] + colWidths[1] - 5, currentY, { align: 'right' });
      
      // Unit Price (right-aligned)
      doc.text(formatCurrency(unitPrice, language), colPositions[2] + colWidths[2] - 5, currentY, { align: 'right' });
      
      // Total Price (right-aligned)
      doc.text(formatCurrency(totalPrice, language), colPositions[3] + colWidths[3] - 5, currentY, { align: 'right' });
      
      currentY += 10;
    });
  } else {
    doc.text('No items', margin, currentY);
    currentY += 10;
  }

  // Draw line above total
  currentY += 5;
  doc.line(colPositions[2], currentY - 2, pageWidth - margin, currentY - 2);
  currentY += 5;

  // Total
  doc.setFontSize(baseFontSize + 2);
  doc.setTextColor(template.colors.primary || '#EF4B24');
  doc.text(template.content.totalLabel || t.total, colPositions[2], currentY);
  doc.text(formatCurrency(order.total_amount || 0, language), pageWidth - margin - 5, currentY, { align: 'right' });

  // Footer
  currentY += 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(template.content.footerText || t.thankYou, pageWidth / 2, currentY, { align: 'center' });

  return doc;
};

export const emailQuote = async (quote, customer, pdfDoc) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = pdfDoc.output('datauristring');
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare email data
    const emailData = {
      userId: user?.id,
      to: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      subject: `Quote ${quote.quote_number || quote.id.slice(0, 8)} from Promocups`,
      template: 'quote-email',
      data: {
        quoteNumber: quote.quote_number || quote.id.slice(0, 8),
        customerName: `${customer.first_name} ${customer.last_name}`,
        companyName: customer.company_name,
        validUntil: new Date(quote.valid_until).toLocaleDateString(),
        totalAmount: quote.total,
        quoteDescription: quote.description || 'Please review the attached quote document for detailed information.'
      }
    };
    
    // Send the email using emailUtils
    const result = await emailUtils.sendEmail(emailData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    
    // Create a notification about the email
    if (isSupabaseConfigured && user?.id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            title: 'Quote Email Sent',
            message: `Quote ${quote.quote_number || quote.id.slice(0, 8)} sent to ${customer.email}`,
            type: 'quote'
          }]);

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }

    return { success: true, messageId: result.messageId || `mock-${Date.now()}` };
  } catch (error) {
    console.error('Error sending quote email:', error);
    throw error;
  }
};

export const emailOrder = async (order, customer, pdfDoc) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = pdfDoc.output('datauristring');
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Prepare email data
    const emailData = {
      userId: user?.id,
      to: customer.email,
      customerName: `${customer.first_name} ${customer.last_name}`,
      subject: `Order Confirmation - ${order.quote_number || order.id.slice(0, 8)}`,
      template: 'orderConfirmation',
      data: {
        orderNumber: order.quote_number || order.id.slice(0, 8),
        customerName: `${customer.first_name} ${customer.last_name}`,
        companyName: customer.company_name,
        orderDate: new Date(order.created_at).toLocaleDateString(),
        totalAmount: order.total_amount,
        orderStatus: order.status,
        estimatedDelivery: order.delivery && order.delivery.length > 0 && order.delivery[0].estimated_delivery
          ? new Date(order.delivery[0].estimated_delivery).toLocaleDateString()
          : 'To be determined',
        shippingAddress: order.shipping_address || 'Not specified'
      }
    };
    
    // Send the email using emailUtils
    const result = await emailUtils.sendEmail(emailData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    
    // Create a notification about the email
    if (isSupabaseConfigured && user?.id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            title: 'Order Confirmation Email Sent',
            message: `Order confirmation for ${order.quote_number || order.id.slice(0, 8)} sent to ${customer.email}`,
            type: 'sale'
          }]);

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }

    return { success: true, messageId: result.messageId || `mock-${Date.now()}` };
  } catch (error) {
    console.error('Error sending order email:', error);
    throw error;
  }
};