import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import QuoteFormDialog from "@/components/quotes/QuoteFormDialog";
import QuoteTable from "@/components/quotes/QuoteTable";
import { generateQuotePDF, emailQuote } from "@/lib/pdfUtils";
import { supabase, isSupabaseConfigured, subscribeToTable, generateQuoteNumber } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPageData();
      
      // Subscribe to real-time changes
      const unsubscribeQuotes = subscribeToTable(
        'quotes',
        (payload) => {
          console.log('Quote change detected:', payload);
          loadPageData();
        },
        `user_id=eq.${user.id}`
      );

      const unsubscribeCustomers = subscribeToTable(
        'customers',
        (payload) => {
          console.log('Customer change detected:', payload);
          loadPageData();
        },
        `user_id=eq.${user.id}`
      );

      // Cleanup subscriptions
      return () => {
        unsubscribeQuotes();
        unsubscribeCustomers();
      };
    }
  }, [user]);

  const loadPageData = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Use demo data when Supabase is not configured
        console.log('Using demo data - Supabase not configured');
        setQuotes([
          {
            id: '1',
            quote_number: 'QT-2025-000001',
            customer_id: '1',
            title: 'Demo Quote 1',
            description: 'Demo quote for testing',
            status: 'sent',
            subtotal: 5000,
            tax: 400,
            total: 5400,
            created_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
              { description: 'Product A', quantity: 2, price: 1500 },
              { description: 'Product B', quantity: 1, price: 2000 }
            ]
          },
          {
            id: '2',
            quote_number: 'QT-2025-000002',
            customer_id: '2',
            title: 'Demo Quote 2',
            description: 'Another demo quote',
            status: 'accepted',
            subtotal: 3000,
            tax: 240,
            total: 3240,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
              { description: 'Service X', quantity: 1, price: 3000 }
            ]
          }
        ]);
        
        setCustomers([
          {
            id: '1',
            company_name: 'Demo Company 1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@demo1.com',
            contact_language: 'english'
          },
          {
            id: '2',
            company_name: 'Demo Company 2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@demo2.com',
            contact_language: 'french'
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Get quotes where the user is the creator
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*),
          items:quote_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      // Get customers owned by the current user
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('company_name', { ascending: true });

      if (customersError) throw customersError;

      setQuotes(quotesData || []);
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes data. Using demo data instead.",
        variant: "destructive"
      });
      
      // Fallback to demo data
      setQuotes([
        {
          id: '1',
          quote_number: 'DEMO-001',
          customer_id: '1',
          title: 'Demo Quote',
          status: 'draft',
          total: 1000,
          created_at: new Date().toISOString(),
          items: [
            { description: 'Demo Product', quantity: 1, price: 1000 }
          ]
        }
      ]);
      setCustomers([
        {
          id: '1',
          company_name: 'Demo Company',
          first_name: 'Demo',
          last_name: 'Customer',
          contact_language: 'english'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (quoteData) => {
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 5);

      if (!isSupabaseConfigured) {
        // Demo mode
        if (editingQuote) {
          setQuotes(prev => prev.map(quote => 
            quote.id === editingQuote.id 
              ? { 
                  ...quote, 
                  ...quoteData, 
                  updated_at: new Date().toISOString(),
                  items: quoteData.items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price
                  }))
                }
              : quote
          ));
          toast({
            title: "Quote Updated (Demo Mode)",
            description: "The quote has been updated in demo data."
          });
        } else {
          const newQuoteNumber = generateQuoteNumber();
          const newQuote = {
            id: Date.now().toString(),
            quote_number: newQuoteNumber,
            user_id: user.id,
            customer_id: quoteData.customerId,
            title: quoteData.title || 'Untitled Quote',
            description: quoteData.description,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            total: quoteData.total,
            status: 'draft',
            created_at: new Date().toISOString(),
            valid_until: validUntil.toISOString(),
            items: quoteData.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price
            }))
          };
          setQuotes(prev => [newQuote, ...prev]);
          toast({
            title: "Quote Created (Demo Mode)",
            description: `Quote ${newQuoteNumber} created in demo data.`
          });
        }
        
        setIsFormDialogOpen(false);
        setEditingQuote(null);
        return;
      }

      if (editingQuote) {
        // First update the quote
        const { error: quoteError } = await supabase
          .from('quotes')
          .update({
            customer_id: quoteData.customerId,
            title: quoteData.title || 'Untitled Quote',
            description: quoteData.description,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            total: quoteData.total,
            valid_until: validUntil.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingQuote.id)
          .eq('user_id', user.id);

        if (quoteError) throw quoteError;
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', editingQuote.id);
          
        if (deleteError) throw deleteError;
        
        // Insert new items
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            quoteData.items.map(item => ({
              quote_id: editingQuote.id,
              description: item.description,
              quantity: item.quantity,
              price: item.price
            }))
          );
          
        if (itemsError) throw itemsError;

        toast({
          title: "Quote Updated",
          description: "The quote has been successfully updated."
        });
      } else {
        const newQuoteNumber = generateQuoteNumber();
        
        // Create new quote
        const { data: newQuote, error: quoteError } = await supabase
          .from('quotes')
          .insert([{
            quote_number: newQuoteNumber,
            user_id: user.id,
            customer_id: quoteData.customerId,
            title: quoteData.title || 'Untitled Quote',
            description: quoteData.description,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            total: quoteData.total,
            valid_until: validUntil.toISOString(),
            status: 'draft'
          }])
          .select()
          .single();

        if (quoteError) throw quoteError;
        
        // Insert items
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            quoteData.items.map(item => ({
              quote_id: newQuote.id,
              description: item.description,
              quantity: item.quantity,
              price: item.price
            }))
          );
          
        if (itemsError) throw itemsError;

        toast({
          title: "Quote Created",
          description: `Quote ${newQuoteNumber} has been successfully created.`
        });
      }

      setIsFormDialogOpen(false);
      setEditingQuote(null);
      loadPageData(); // Reload data to get the updated quotes with items
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save quote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setQuotes(prev => prev.map(quote => 
          quote.id === id 
            ? { ...quote, status: newStatus, updated_at: new Date().toISOString() }
            : quote
        ));
        toast({
          title: "Status Updated (Demo Mode)",
          description: `Quote status updated to ${newStatus} in demo data.`
        });
        return;
      }

      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Quote status updated to ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuote = async () => {
    if (selectedQuote) {
      try {
        if (!isSupabaseConfigured) {
          // Demo mode
          setQuotes(prev => prev.filter(quote => quote.id !== selectedQuote.id));
          setIsDeleteDialogOpen(false);
          setSelectedQuote(null);
          toast({
            title: "Quote Deleted (Demo Mode)",
            description: "The quote has been removed from demo data.",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', selectedQuote.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsDeleteDialogOpen(false);
        setSelectedQuote(null);
        toast({
          title: "Quote Deleted",
          description: "The quote has been successfully deleted.",
          variant: "destructive"
        });
        
        loadPageData(); // Reload data to get the updated quotes list
      } catch (error) {
        console.error('Error deleting quote:', error);
        toast({
          title: "Error",
          description: "Failed to delete quote",
          variant: "destructive"
        });
      }
    }
  };

  const handleConvertToSale = async (quoteId) => {
    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) throw new Error('Quote not found');

      if (!isSupabaseConfigured) {
        // Demo mode
        await handleUpdateStatus(quoteId, 'ordered');
        toast({
          title: "Quote Converted (Demo Mode)",
          description: "Quote converted to order in demo data."
        });
        return;
      }

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('address')
        .eq('id', quote.customer_id)
        .single();

      if (customerError) throw customerError;

      // Create order with the same quote number
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          quote_number: quote.quote_number, // Use the same quote number
          user_id: user.id,
          customer_id: quote.customer_id,
          status: 'pending',
          total_amount: quote.total,
          shipping_address: customer.address || 'Address pending',
          payment_status: 'unpaid'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create delivery record with the same quote number
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert([{
          order_id: order.id,
          quote_number: quote.quote_number, // Use the same quote number
          status: 'pending',
          carrier: 'fedex',
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (deliveryError) throw deliveryError;

      // Create order items from quote items
      if (quote.items && quote.items.length > 0) {
        const orderItems = quote.items.map(item => ({
          order_id: order.id,
          product_name: item.description,
          product_description: '',
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.quantity * item.price
        }));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
          
        if (itemsError) throw itemsError;
      }

      await handleUpdateStatus(quoteId, 'ordered');

      toast({
        title: "Quote Converted",
        description: `Quote ${quote.quote_number} successfully converted to order and will appear in Sales page.`
      });
      
      loadPageData(); // Reload data to get the updated quotes
    } catch (error) {
      console.error('Error converting quote to sale:', error);
      toast({
        title: "Error",
        description: "Failed to convert quote to order",
        variant: "destructive"
      });
    }
  };

  const handleSendReminder = async (quote) => {
    try {
      setSendingReminder(true);
      
      const customer = customers.find(c => c.id === quote.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      toast({
        title: "Generating Quote PDF",
        description: "Creating PDF document for email...",
      });

      const pdfDoc = generateQuotePDF(quote, customer);
      
      toast({
        title: "Sending Email",
        description: `Sending quote ${quote.quote_number} to ${customer.email}...`,
      });

      try {
        await emailQuote(quote, customer, pdfDoc);
        
        if (isSupabaseConfigured) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              user_id: user.id,
              title: 'Quote Reminder Sent',
              message: `Email reminder with PDF sent to ${customer.first_name} ${customer.last_name} for quote ${quote.quote_number}`,
              type: 'quote'
            }]);

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }

        toast({
          title: "Email Sent Successfully",
          description: `Quote ${quote.quote_number} with PDF attachment sent to ${customer.email}`,
        });

      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        if (isSupabaseConfigured) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
              user_id: user.id,
              title: 'Quote Reminder - Email Service Issue',
              message: `Attempted to send quote ${quote.quote_number} to ${customer.first_name} ${customer.last_name}, but email service is not configured`,
              type: 'quote'
            }]);

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        }

        toast({
          title: "Email Service Not Configured",
          description: `PDF generated successfully, but email service needs to be set up. Quote: ${quote.quote_number}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send email reminder",
        variant: "destructive"
      });
    } finally {
      setSendingReminder(false);
    }
  };
  
  const openEditDialog = (quote) => {
    setEditingQuote(quote);
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (quote) => {
    setSelectedQuote(quote);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateQuote = () => {
    setEditingQuote(null);
    setIsFormDialogOpen(true);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? quote.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col">
      <Header title="Quotes Management" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
              setIsFormDialogOpen(isOpen);
              if (!isOpen) setEditingQuote(null);
            }}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateQuote} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />Create Quote
                </Button>
              </DialogTrigger>
              {isFormDialogOpen && (
                <DialogContent className="sm:max-w-[800px]">
                  <QuoteFormDialog 
                    onOpenChange={setIsFormDialogOpen} 
                    customers={customers} 
                    onSubmit={handleFormSubmit} 
                    quoteToEdit={editingQuote} 
                  />
                </DialogContent>
              )}
            </Dialog>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input className="pl-10 w-full sm:w-64" placeholder="Search quotes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center"><Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="All Statuses" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <QuoteTable 
            quotes={filteredQuotes} 
            customers={customers}
            onEdit={openEditDialog}
            onUpdateStatus={handleUpdateStatus}
            onConvertToSale={handleConvertToSale}
            onDelete={openDeleteDialog}
            onSendReminder={handleSendReminder}
            sendingReminder={sendingReminder}
            loading={loading}
            onCreateQuote={handleCreateQuote}
          />
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteQuote}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;