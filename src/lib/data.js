import { v4 as uuidv4 } from 'uuid';
import { getCustomers, addCustomer } from '@/lib/customerData';
import { getQuotes, addQuote, updateQuote, getQuoteById } from '@/lib/quoteData';
import { getSales, addSale } from '@/lib/saleData';
import { initializeStorageKey } from '@/lib/localStorageUtils';
import { seedProducts, getProducts } from '@/lib/productData';

// Initialize all storage keys
const initializeAllStorage = () => {
  initializeStorageKey('customers');
  initializeStorageKey('quotes');
  initializeStorageKey('sales');
  initializeStorageKey('products');
};

initializeAllStorage();


// Convert quote to sale
export const convertQuoteToSale = (quoteId) => {
  const quote = getQuoteById(quoteId);
  if (!quote) return null;
  
  const sale = {
    quoteId: quote.id,
    customerId: quote.customerId,
    amount: quote.total,
    title: `Sale from quote #${quote.id.substring(0, 8)}`,
    description: quote.description || '',
    status: 'lead'
  };
  
  const newSale = addSale(sale);
  updateQuote(quoteId, { status: 'accepted' });
  return newSale;
};

// Get dashboard stats
export const getDashboardStats = () => {
  const quotes = getQuotes();
  const sales = getSales();
  const customers = getCustomers();
  
  const totalQuotes = quotes.length;
  const totalSales = sales.length;
  const totalCustomers = customers.length;
  
  const pendingQuotes = quotes.filter(q => q.status === 'sent').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const declinedQuotes = quotes.filter(q => q.status === 'declined').length;
  
  const wonSales = sales.filter(s => s.status === 'won').length;
  const lostSales = sales.filter(s => s.status === 'lost').length;
  const activeSales = sales.filter(s => !['won', 'lost'].includes(s.status)).length;
  
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);
  const totalSalesValue = sales
    .filter(s => s.status === 'won')
    .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  
  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  return {
    totalQuotes,
    totalSales,
    totalCustomers,
    pendingQuotes,
    acceptedQuotes,
    declinedQuotes,
    wonSales,
    lostSales,
    activeSales,
    totalQuoteValue,
    totalSalesValue,
    recentQuotes,
    recentSales
  };
};

// Seed data for testing
export const seedData = () => {
  // Clear existing data for customers, quotes, sales. Products are seeded separately.
  localStorage.setItem('customers', JSON.stringify([]));
  localStorage.setItem('quotes', JSON.stringify([]));
  localStorage.setItem('sales', JSON.stringify([]));
  
  // Add sample customers
  const customersData = [
    {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '555-123-4567',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
      contactPerson: 'John Smith',
      notes: 'Large enterprise client with multiple departments'
    },
    {
      name: 'TechStart Inc.',
      email: 'info@techstart.io',
      phone: '555-987-6543',
      address: '456 Innovation Blvd, San Francisco, CA 94107',
      contactPerson: 'Sarah Johnson',
      notes: 'Startup with rapid growth, interested in premium services'
    },
    {
      name: 'Global Retail Solutions',
      email: 'sales@globalretail.com',
      phone: '555-456-7890',
      address: '789 Commerce St, Chicago, IL 60611',
      contactPerson: 'Michael Chen',
      notes: 'Retail chain looking for enterprise solutions'
    }
  ];
  
  const customerIds = customersData.map(customer => addCustomer(customer).id);
  
  // Add sample quotes
  const quotesData = [
    {
      customerId: customerIds[0],
      title: 'Enterprise Software Package',
      description: 'Complete enterprise software solution including CRM, ERP, and analytics',
      items: [
        { description: 'CRM Software License', quantity: 1, price: 5000 },
        { description: 'ERP Module', quantity: 1, price: 7500 },
        { description: 'Analytics Dashboard', quantity: 1, price: 3000 },
        { description: 'Implementation Services', quantity: 40, price: 150 }
      ],
      subtotal: 21500,
      tax: 1720,
      total: 23220,
      status: 'sent',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customerId: customerIds[1],
      title: 'Startup Growth Package',
      description: 'Tailored software package for growing startups',
      items: [
        { description: 'CRM Starter License', quantity: 1, price: 2000 },
        { description: 'Marketing Automation', quantity: 1, price: 1500 },
        { description: 'Technical Support (1 year)', quantity: 1, price: 1200 }
      ],
      subtotal: 4700,
      tax: 376,
      total: 5076,
      status: 'accepted',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  const quoteIds = quotesData.map(quote => addQuote(quote).id);
  
  // Add sample sales
  const salesData = [
    {
      quoteId: quoteIds[1],
      customerId: customerIds[1],
      title: 'Startup Growth Package Sale',
      description: 'Sale from accepted quote for TechStart Inc.',
      amount: 5076,
      status: 'won',
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      customerId: customerIds[0],
      title: 'Maintenance Contract',
      description: 'Annual maintenance contract for existing systems',
      amount: 12000,
      status: 'negotiation',
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  salesData.forEach(sale => addSale(sale));

  // Seed products if not already seeded
  seedProducts();
  
  return {
    customerIds,
    quoteIds,
    message: 'Sample data has been added successfully'
  };
};