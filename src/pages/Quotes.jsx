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
import { getQuotes, addQuote, updateQuote, deleteQuote } from "@/lib/quoteData";
import { getCustomers } from "@/lib/customerData";
import { convertQuoteToSale } from "@/lib/data";

const Quotes = () => {
  const [quotes, setQuotesState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = () => {
    setQuotesState(getQuotes());
    setCustomersState(getCustomers());
  };

  const resetEditingQuoteState = () => {
    setEditingQuote(null);
  };

  const handleFormSubmit = (quoteData) => {
    if (editingQuote) {
      updateQuote(editingQuote.id, quoteData);
      toast({ title: "Quote Updated", description: "The quote has been successfully updated." });
    } else {
      addQuote(quoteData);
      toast({ title: "Quote Created", description: "The quote has been successfully created." });
    }
    loadPageData();
    setIsFormDialogOpen(false);
    resetEditingQuoteState();
  };
  
  const handleUpdateStatus = (id, newStatus) => {
    updateQuote(id, { status: newStatus });
    loadPageData();
    toast({ title: "Status Updated", description: `Quote status updated to ${newStatus}.` });
  };

  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteQuote(selectedQuote.id);
      loadPageData();
      setIsDeleteDialogOpen(false);
      setSelectedQuote(null);
      toast({ title: "Quote Deleted", description: "The quote has been successfully deleted.", variant: "destructive" });
    }
  };

  const handleConvertToSale = (quoteId) => {
    const newSale = convertQuoteToSale(quoteId);
    if (newSale) {
      loadPageData();
      toast({ title: "Converted to Sale", description: "Quote successfully converted." });
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
    const customer = customers.find(c => c.id === quote.customerId);
    const customerName = customer ? customer.name.toLowerCase() : "";
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
              if (!isOpen) resetEditingQuoteState();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingQuote(null); /* setIsFormDialogOpen(true) is handled by DialogTrigger */ }} className="bg-indigo-600 hover:bg-indigo-700">
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
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteQuote}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;