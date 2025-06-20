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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const SaleFormDialog = ({ open, onOpenChange, customers, onSubmit, saleToEdit }) => {
  const [currentSale, setCurrentSale] = useState({
    customerId: "", 
    title: "", 
    description: "", 
    amount: 0, 
    status: "pending",
    payment_status: "unpaid",
    expectedCloseDate: ""
  });

  useEffect(() => {
    if (saleToEdit) {
      setCurrentSale({
        customerId: saleToEdit.customer_id,
        title: saleToEdit.title || `Order #${saleToEdit.id.slice(0, 8)}`,
        description: saleToEdit.description || "",
        amount: saleToEdit.total_amount,
        status: saleToEdit.status,
        payment_status: saleToEdit.payment_status,
        expectedCloseDate: saleToEdit.expected_close_date || ""
      });
    } else {
      resetCurrentSale();
    }
  }, [saleToEdit, open]);

  const resetCurrentSale = () => setCurrentSale({
    customerId: "", 
    title: "", 
    description: "", 
    amount: 0, 
    status: "pending",
    payment_status: "unpaid",
    expectedCloseDate: ""
  });

  const handleChange = (id, value) => setCurrentSale(prev => ({ ...prev, [id]: value }));
  
  const handleSubmit = () => {
    onSubmit(currentSale);
  };

  const paymentStatuses = [
    { value: "unpaid", label: "Unpaid" },
    { value: "half_paid", label: "Half Paid" },
    { value: "fully_paid", label: "Fully Paid" }
  ];

  const orderStatuses = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if(!isOpen) resetCurrentSale(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{saleToEdit ? "Edit Order" : "Add New Order"}</DialogTitle>
          <DialogDescription>{saleToEdit ? "Update order details." : "Add a new order to track."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select value={currentSale.customerId} onValueChange={(val) => handleChange("customerId", val)}>
                <SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name || `${c.first_name} ${c.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={currentSale.status} onValueChange={(val) => handleChange("status", val)}>
                <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {orderStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Order Title</Label>
            <Input id="title" value={currentSale.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Enter order title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" value={currentSale.amount} onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)} placeholder="Enter amount" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select value={currentSale.payment_status} onValueChange={(val) => handleChange("payment_status", val)}>
                <SelectTrigger id="payment_status"><SelectValue placeholder="Select payment status" /></SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={currentSale.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Enter order description" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{saleToEdit ? "Save Changes" : "Add Order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPageData();
      
      // Subscribe to real-time changes if Supabase is configured
      if (isSupabaseConfigured) {
        const ordersChannel = supabase
          .channel('orders-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
            },
            (payload) => {
              console.log('Orders changed:', payload);
              loadPageData();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(ordersChannel);
        };
      }
    }
  }, [user]);

  const loadPageData = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Use demo data when Supabase is not configured
        console.log('Using demo data - Supabase not configured');
        setSales([
          {
            id: '1',
            customer_id: '1',
            title: 'Demo Order #1',
            status: 'pending',
            payment_status: 'unpaid',
            total_amount: 5000,
            created_at: new Date().toISOString(),
            customer: {
              id: '1',
              first_name: 'John',
              last_name: 'Smith',
              company_name: 'Acme Corporation'
            }
          },
          {
            id: '2',
            customer_id: '2',
            title: 'Demo Order #2',
            status: 'delivered',
            payment_status: 'fully_paid',
            total_amount: 3500,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            customer: {
              id: '2',
              first_name: 'Sarah',
              last_name: 'Johnson',
              company_name: 'TechStart Inc.'
            }
          }
        ]);
        
        setCustomers([
          {
            id: '1',
            company_name: 'Acme Corporation',
            first_name: 'John',
            last_name: 'Smith'
          },
          {
            id: '2',
            company_name: 'TechStart Inc.',
            first_name: 'Sarah',
            last_name: 'Johnson'
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Get orders (sales) with customer details from Supabase
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, first_name, last_name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      setSales(orders || []);
      
      // Get all customers for the form dropdown
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('company_name', { ascending: true });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      setCustomers(customersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data. Using demo data instead.",
        variant: "destructive"
      });
      
      // Fallback to demo data
      setSales([
        {
          id: '1',
          customer_id: '1',
          title: 'Demo Order #1',
          status: 'pending',
          payment_status: 'unpaid',
          total_amount: 5000,
          created_at: new Date().toISOString(),
          customer: {
            id: '1',
            first_name: 'Demo',
            last_name: 'Customer',
            company_name: 'Demo Company'
          }
        }
      ]);
      
      setCustomers([
        {
          id: '1',
          company_name: 'Demo Company',
          first_name: 'Demo',
          last_name: 'Customer'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (saleData) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        if (editingSale) {
          setSales(prev => prev.map(sale => 
            sale.id === editingSale.id 
              ? { 
                  ...sale, 
                  customer_id: saleData.customerId,
                  title: saleData.title,
                  status: saleData.status,
                  payment_status: saleData.payment_status,
                  total_amount: saleData.amount,
                  updated_at: new Date().toISOString()
                }
              : sale
          ));
          toast({
            title: "Order Updated (Demo Mode)",
            description: "Order details successfully updated in demo data."
          });
        } else {
          const newSale = {
            id: Date.now().toString(),
            customer_id: saleData.customerId,
            title: saleData.title,
            status: saleData.status,
            payment_status: saleData.payment_status,
            total_amount: saleData.amount,
            created_at: new Date().toISOString(),
            customer: customers.find(c => c.id === saleData.customerId)
          };
          setSales(prev => [newSale, ...prev]);
          toast({
            title: "Order Created (Demo Mode)",
            description: "New order added to demo data."
          });
        }
        
        setIsFormDialogOpen(false);
        setEditingSale(null);
        return;
      }

      if (editingSale) {
        const { error } = await supabase
          .from('orders')
          .update({
            customer_id: saleData.customerId,
            status: saleData.status,
            payment_status: saleData.payment_status,
            total_amount: saleData.amount,
            shipping_address: saleData.description || "TBD",
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSale.id);

        if (error) throw error;

        toast({
          title: "Order Updated",
          description: "Order details successfully updated."
        });
      } else {
        const { error } = await supabase
          .from('orders')
          .insert([{
            user_id: user.id,
            customer_id: saleData.customerId,
            status: saleData.status,
            payment_status: saleData.payment_status,
            total_amount: saleData.amount,
            shipping_address: saleData.description || "TBD"
          }]);

        if (error) throw error;

        toast({
          title: "Order Created",
          description: "New order added to pipeline."
        });
      }

      loadPageData();
      setIsFormDialogOpen(false);
      setEditingSale(null);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePaymentStatus = async (id, newStatus) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setSales(prev => prev.map(sale => 
          sale.id === id 
            ? { ...sale, payment_status: newStatus, updated_at: new Date().toISOString() }
            : sale
        ));
        toast({
          title: "Payment Status Updated (Demo Mode)",
          description: `Payment status changed to ${newStatus} in demo data.`
        });
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      loadPageData();
      toast({
        title: "Payment Status Updated",
        description: `Payment status changed to ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSale = async () => {
    if (selectedSale) {
      try {
        if (!isSupabaseConfigured) {
          // Demo mode
          setSales(prev => prev.filter(sale => sale.id !== selectedSale.id));
          setIsDeleteDialogOpen(false);
          setSelectedSale(null);
          toast({
            title: "Order Deleted (Demo Mode)",
            description: "Order removed from demo data.",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', selectedSale.id);

        if (error) throw error;

        loadPageData();
        setIsDeleteDialogOpen(false);
        setSelectedSale(null);
        toast({
          title: "Order Deleted",
          description: "Order removed from pipeline.",
          variant: "destructive"
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Error",
          description: "Failed to delete order",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (sale) => {
    setEditingSale(sale);
    setIsFormDialogOpen(true);
  };
  
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? sale.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getCustomerName = (customer) => {
    if (!customer) return "Unknown Customer";
    return customer.company_name || `${customer.first_name} ${customer.last_name}`;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'half_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'fully_paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Sales Pipeline" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Sales Pipeline" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSale(null); setIsFormDialogOpen(true); }} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />Add Order
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input className="pl-10 w-full sm:w-64" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center"><Filter className="h-4 w-4 mr-2 text-gray-400" /><SelectValue placeholder="All Statuses" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
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
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <motion.tr key={sale.id} variants={itemVariants} className="border-b hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                              {sale.title || `Order #${sale.id.slice(0, 8)}`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              {getCustomerName(sale.customer)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(sale.status)}`}>
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(sale.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              {sale.total_amount?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.payment_status)}`}>
                              {sale.payment_status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Select
                                value={sale.payment_status}
                                onValueChange={(value) => handleUpdatePaymentStatus(sale.id, value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unpaid">Unpaid</SelectItem>
                                  <SelectItem value="half_paid">Half Paid</SelectItem>
                                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(sale)} title="Edit Order">
                                <Edit className="h-4 w-4 text-amber-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => {setSelectedSale(sale); setIsDeleteDialogOpen(true);}} title="Delete">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {loading ? "Loading orders..." : "No orders found. Orders from converted quotes will appear here."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <SaleFormDialog 
        open={isFormDialogOpen} 
        onOpenChange={setIsFormDialogOpen} 
        customers={customers} 
        onSubmit={handleFormSubmit} 
        saleToEdit={editingSale}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSale}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;