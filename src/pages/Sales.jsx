import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, TrendingUp, Search, Filter, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { getSales, addSale, updateSale, deleteSale } from "@/lib/saleData";
import { getCustomers } from "@/lib/customerData";

const SaleFormDialog = ({ open, onOpenChange, customers, onSubmit, saleToEdit }) => {
  const [currentSale, setCurrentSale] = useState({
    customerId: "", title: "", description: "", amount: 0, status: "lead", expectedCloseDate: ""
  });

  useEffect(() => {
    if (saleToEdit) {
      setCurrentSale(saleToEdit);
    } else {
      resetCurrentSale();
    }
  }, [saleToEdit, open]);

  const resetCurrentSale = () => setCurrentSale({
    customerId: "", title: "", description: "", amount: 0, status: "lead", expectedCloseDate: ""
  });

  const handleChange = (id, value) => setCurrentSale(prev => ({ ...prev, [id]: value }));
  
  const handleSubmit = () => {
    onSubmit(currentSale);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if(!isOpen) resetCurrentSale(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{saleToEdit ? "Edit Sale" : "Add New Sale"}</DialogTitle>
          <DialogDescription>{saleToEdit ? "Update sale details." : "Add a new sales opportunity."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={currentSale.customerId} onValueChange={(val) => handleChange("customerId", val)}>
                <SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={currentSale.status} onValueChange={(val) => handleChange("status", val)}>
                <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {["lead", "negotiation", "won", "lost"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Sale Title</Label>
            <Input id="title" value={currentSale.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Enter sale title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={currentSale.amount} onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)} placeholder="Enter amount" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input id="expectedCloseDate" type="date" value={currentSale.expectedCloseDate} onChange={(e) => handleChange("expectedCloseDate", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={currentSale.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Enter sale description" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{saleToEdit ? "Save Changes" : "Add Sale"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Sales = () => {
  const [sales, setSalesState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadPageData(); }, []);

  const loadPageData = () => {
    setSalesState(getSales());
    setCustomersState(getCustomers());
  };

  const handleFormSubmit = (saleData) => {
    if (editingSale) {
      updateSale(editingSale.id, saleData);
      toast({ title: "Sale Updated", description: "Sale details successfully updated." });
    } else {
      addSale(saleData);
      toast({ title: "Sale Created", description: "New sale added to pipeline." });
    }
    loadPageData();
    setIsFormDialogOpen(false);
    setEditingSale(null);
  };

  const handleUpdateStatus = (id, newStatus) => {
    updateSale(id, { status: newStatus });
    loadPageData();
    toast({ title: "Status Updated", description: `Sale status changed to ${newStatus}.` });
  };

  const handleDeleteSale = () => {
    if (selectedSale) {
      deleteSale(selectedSale.id);
      loadPageData();
      setIsDeleteDialogOpen(false);
      setSelectedSale(null);
      toast({ title: "Sale Deleted", description: "Sale removed from pipeline.", variant: "destructive" });
    }
  };

  const openEditDialog = (sale) => {
    setEditingSale(sale);
    setIsFormDialogOpen(true);
  };
  
  const filteredSales = sales.filter(sale => {
    const customer = customers.find(c => c.id === sale.customerId);
    const customerName = customer ? customer.name.toLowerCase() : "";
    const matchesSearch = sale.title.toLowerCase().includes(searchTerm.toLowerCase()) || customerName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? sale.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getCustomerName = (customerId) => customers.find(c => c.id === customerId)?.name || "Unknown";

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};

  return (
    <div className="h-full flex flex-col">
      <Header title="Sales Pipeline" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSale(null); setIsFormDialogOpen(true); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />Add Sale
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input className="pl-10 w-full sm:w-64" placeholder="Search sales..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center"><Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="All Statuses" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {["lead", "negotiation", "won", "lost"].map(s=><SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale</TableHead><TableHead>Customer</TableHead><TableHead>Expected Close</TableHead>
                      <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <motion.tr key={sale.id} variants={itemVariants} className="border-b hover:bg-gray-50">
                          <TableCell className="font-medium"><div className="flex items-center"><TrendingUp className="h-4 w-4 text-green-500 mr-2" />{sale.title}</div></TableCell>
                          <TableCell><div className="flex items-center"><User className="h-4 w-4 text-gray-400 mr-2" />{getCustomerName(sale.customerId)}</div></TableCell>
                          <TableCell><div className="flex items-center text-gray-500"><Calendar className="h-3 w-3 mr-1" />{sale.expectedCloseDate ? new Date(sale.expectedCloseDate).toLocaleDateString() : 'N/A'}</div></TableCell>
                          <TableCell><div className="flex items-center"><DollarSign className="h-4 w-4 text-gray-400" />{sale.amount?.toLocaleString()}</div></TableCell>
                          <TableCell><span className={`status-badge status-${sale.status}`}>{sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</span></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(sale)} title="Edit Sale"><Edit className="h-4 w-4 text-amber-500" /></Button>
                              {sale.status !== 'won' && sale.status !== 'lost' && (<>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(sale.id, 'won')} title="Won"><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(sale.id, 'lost')} title="Lost"><XCircle className="h-4 w-4 text-red-500" /></Button>
                              </>)}
                              <Button variant="ghost" size="icon" onClick={() => {setSelectedSale(sale); setIsDeleteDialogOpen(true);}} title="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (<TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No sales found.</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <SaleFormDialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} customers={customers} onSubmit={handleFormSubmit} saleToEdit={editingSale}/>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteSale}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;