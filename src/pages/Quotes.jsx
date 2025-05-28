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
import { supabase } from "@/lib/supabase";
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
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPageData();
    }
  }, [user]);

  const loadPageData = async () => {
    try {
      // Get quotes that belong to customers where the user is authorized
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*)
        `);

      if (quotesError) throw quotesError;

      // Get customers from the customers table
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      setQuotes(quotesData || []);
      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes data",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (quoteData) => {
    try {
      // Verify that the customer exists and user has access
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', quoteData.customerId)
        .single();

      if (customerError) throw new Error('Invalid customer selected');

      if (editingQuote) {
        const { error } = await supabase
          .from('quotes')
          .update({
            customer_id: quoteData.customerId,
            title: quoteData.title,
            description: quoteData.description,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            total: quoteData.total,
            valid_until: quoteData.validUntil,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingQuote.id);

        if (error) throw error;

        toast({
          title: "Quote Updated",
          description: "The quote has been successfully updated."
        });
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            customer_id: quoteData.customerId,
            title: quoteData.title,
            description: quoteData.description,
            subtotal: quoteData.subtotal,
            tax: quoteData.tax,
            total: quoteData.total,
            valid_until: quoteData.validUntil,
            status: 'draft' // Explicitly set initial status
          }]);

        if (error) throw error;

        toast({
          title: "Quote Created",
          description: "The quote has been successfully created."
        });
      }

      loadPageData();
      setIsFormDialogOpen(false);
      setEditingQuote(null);
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
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      loadPageData();
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
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', selectedQuote.id);

        if (error) throw error;

        loadPageData();
        setIsDeleteDialogOpen(false);
        setSelectedQuote(null);
        toast({
          title: "Quote Deleted",
          description: "The quote has been successfully deleted.",
          variant: "destructive"
        });
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

      // Get customer details to get the shipping address
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('address')
        .eq('id', quote.customer_id)
        .single();

      if (customerError) throw customerError;

      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_id: quote.customer_id,
          status: 'pending',
          total_amount: quote.total,
          shipping_address: customer.address || 'Address pending'
        }]);

      if (error) throw error;

      // Update quote status
      await handleUpdateStatus(quoteId, 'accepted');

      loadPageData();
      toast({
        title: "Quote Converted",
        description: "Quote successfully converted to sale."
      });
    } catch (error) {
      console.error('Error converting quote to sale:', error);
      toast({
        title: "Error",
        description: "Failed to convert quote to sale",
        variant: "destructive"
      });
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

  const filteredQuotes = quotes.filter(quote => {
    const customer = customers.find(c => c.id === quote.customer_id);
    const customerName = customer ? `${customer.first_name} ${customer.last_name}`.toLowerCase() : "";
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) || customerName.includes(searchTerm.toLowerCase());
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
                <Button onClick={() => { setEditingQuote(null); }} className="bg-indigo-600 hover:bg-indigo-700">
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