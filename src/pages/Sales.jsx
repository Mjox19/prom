import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, TrendingUp, Search, Filter, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle, User,
  ArrowUpDown, Eye, Download
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
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured, subscribeToTable, generateQuoteNumber } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import OrderExportButton from "@/components/orders/OrderExportButton";
import OrderViewDialog from "@/components/orders/OrderViewDialog";

const SaleFormDialog = ({ open, onOpenChange, customers, onSubmit, saleToEdit }) => {
  const initialValues = {
    customerId: saleToEdit?.customer_id || "",
    title: saleToEdit?.title || `Order #${Date.now().toString().slice(-6)}`,
    description: saleToEdit?.description || "",
    amount: saleToEdit?.total_amount || 0,
    status: saleToEdit?.status || "pending",
    payment_status: saleToEdit?.payment_status || "unpaid"
  };

  const rules = {
    customerId: [validationRules.required],
    title: [validationRules.required],
    amount: [validationRules.required, validationRules.positiveNumber]
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched: setFieldTouched,
    validateAll,
    reset,
    isValid
  } = useFormValidation(initialValues, rules);

  useEffect(() => {
    if (saleToEdit) {
      Object.keys(initialValues).forEach(key => {
        setValue(key, initialValues[key]);
      });
    } else {
      reset();
    }
  }, [saleToEdit, open]);

  const handleSubmit = () => {
    if (validateAll()) {
      onSubmit(values);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{saleToEdit ? "Edit Order" : "Add New Order"}</DialogTitle>
          <DialogDescription>{saleToEdit ? "Update order details." : "Add a new order to track."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Customer"
              required
              error={touched.customerId && errors.customerId}
              success={touched.customerId && !errors.customerId && values.customerId}
            >
              <Select 
                value={values.customerId} 
                onValueChange={(val) => {
                  setValue("customerId", val);
                  setFieldTouched("customerId");
                }}
              >
                <SelectTrigger className={touched.customerId && errors.customerId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name || `${c.first_name} ${c.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
            
            <ValidatedInput label="Order Status">
              <Select value={values.status} onValueChange={(val) => setValue("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
          </div>
          
          <ValidatedInput
            label="Order Title"
            required
            error={touched.title && errors.title}
            success={touched.title && !errors.title && values.title}
          >
            <Input 
              value={values.title} 
              onChange={(e) => setValue("title", e.target.value)}
              onBlur={() => setFieldTouched("title")}
              placeholder="Enter order title"
              className={touched.title && errors.title ? "border-red-500" : ""}
            />
          </ValidatedInput>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Amount"
              required
              error={touched.amount && errors.amount}
              success={touched.amount && !errors.amount && values.amount}
            >
              <Input 
                type="number" 
                value={values.amount} 
                onChange={(e) => setValue("amount", parseFloat(e.target.value) || 0)}
                onBlur={() => setFieldTouched("amount")}
                placeholder="Enter amount" 
                min="0" 
                step="0.01"
                className={touched.amount && errors.amount ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput label="Payment Status">
              <Select value={values.payment_status} onValueChange={(val) => setValue("payment_status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
          </div>
          
          <ValidatedInput label="Description">
            <Textarea 
              value={values.description} 
              onChange={(e) => setValue("description", e.target.value)} 
              placeholder="Enter order description"
              rows={3}
            />
          </ValidatedInput>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid && Object.keys(touched).length > 0}
          >
            {saleToEdit ? "Save Changes" : "Add Order"}
          </Button>
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
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPageData();
      
      // Subscribe to real-time changes
      const unsubscribeOrders = subscribeToTable(
        'orders',
        (payload) => {
          console.log('Order change detected:', payload);
          loadPageData();
        }
      );

      const unsubscribeCustomers = subscribeToTable(
        'customers',
        (payload) => {
          console.log('Customer change detected:', payload);
          loadPageData();
        }
      );

      // Cleanup subscriptions
      return () => {
        unsubscribeOrders();
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
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSales([
          {
            id: '1',
            quote_number: 'QT-2025-000001',
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
              company_name: 'Acme Corporation',
              contact_language: 'english'
            },
            items: [
              { product_name: 'Demo Product', quantity: 2, unit_price: 2500, total_price: 5000 }
            ],
            shipping_address: '123 Demo St, Demo City, DC 12345'
          },
          {
            id: '2',
            quote_number: 'QT-2025-000002',
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
              company_name: 'TechStart Inc.',
              contact_language: 'french'
            },
            items: [
              { product_name: 'Demo Service', quantity: 1, unit_price: 3500, total_price: 3500 }
            ],
            shipping_address: '456 Demo Ave, Demo City, DC 12345'
          }
        ]);
        
        setCustomers([
          {
            id: '1',
            company_name: 'Acme Corporation',
            first_name: 'John',
            last_name: 'Smith',
            contact_language: 'english'
          },
          {
            id: '2',
            company_name: 'TechStart Inc.',
            first_name: 'Sarah',
            last_name: 'Johnson',
            contact_language: 'french'
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
          customer:customers(id, first_name, last_name, company_name, contact_language),
          items:order_items(*),
          delivery:deliveries(*)
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
          quote_number: 'DEMO-001',
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
            company_name: 'Demo Company',
            contact_language: 'english'
          }
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
          const newQuoteNumber = generateQuoteNumber();
          const newSale = {
            id: Date.now().toString(),
            quote_number: newQuoteNumber,
            customer_id: saleData.customerId,
            title: saleData.title,
            status: saleData.status,
            payment_status: saleData.payment_status,
            total_amount: saleData.amount,
            created_at: new Date().toISOString(),
            customer: customers.find(c => c.id === saleData.customerId),
            shipping_address: saleData.description || "TBD"
          };
          setSales(prev => [newSale, ...prev]);
          toast({
            title: "Order Created (Demo Mode)",
            description: `Order ${newQuoteNumber} added to demo data.`
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
        const newQuoteNumber = generateQuoteNumber();
        
        const { error } = await supabase
          .from('orders')
          .insert([{
            quote_number: newQuoteNumber,
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
          description: `Order ${newQuoteNumber} added to pipeline.`
        });
      }

      setIsFormDialogOpen(false);
      setEditingSale(null);
      loadPageData(); // Reload data to get the updated orders
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

      toast({
        title: "Payment Status Updated",
        description: `Payment status changed to ${newStatus}.`
      });
      
      loadPageData(); // Reload data to get the updated orders
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

        setIsDeleteDialogOpen(false);
        setSelectedSale(null);
        toast({
          title: "Order Deleted",
          description: "Order removed from pipeline.",
          variant: "destructive"
        });
        
        loadPageData(); // Reload data to get the updated orders
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

  const handleViewOrder = (order) => {
    setViewOrder(order);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "text-blue-500" : "text-blue-500 rotate-180"}`} />;
  };
  
  // Filter and sort sales
  const filteredAndSortedSales = sales
    .filter(sale => {
      const matchesSearch = sale.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? sale.status === statusFilter : true;
      const matchesPayment = paymentFilter ? sale.payment_status === paymentFilter : true;
      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested customer data
      if (sortField === 'customer_name') {
        aValue = a.customer ? `${a.customer.first_name} ${a.customer.last_name}` : '';
        bValue = b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : '';
      }
      
      if (sortDirection === "asc") {
        return String(aValue || '').localeCompare(String(bValue || ''));
      } else {
        return String(bValue || '').localeCompare(String(aValue || ''));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredAndSortedSales.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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
        <div className="flex-1 p-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <TableSkeleton rows={5} columns={7} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Sales Pipeline" />
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSale(null); setIsFormDialogOpen(true); }} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />Add Order
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  className="pl-10 w-full sm:w-64" 
                  placeholder="Search orders..." 
                  value={searchTerm} 
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }} 
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={(value) => {
                setPaymentFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-40">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Payment" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="half_paid">Half Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredAndSortedSales.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <EmptyState
                  icon={TrendingUp}
                  title="No orders found"
                  description={searchTerm || statusFilter || paymentFilter ? 
                    "No orders match your current filters. Try adjusting your search criteria." :
                    "No orders found. Orders from converted quotes will appear here, or you can create orders directly."
                  }
                  action={!searchTerm && !statusFilter && !paymentFilter}
                  actionLabel="Add Order"
                  onAction={() => setIsFormDialogOpen(true)}
                />
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("quote_number")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Order #</span>
                              {getSortIcon("quote_number")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("customer_name")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Customer</span>
                              {getSortIcon("customer_name")}
                            </div>
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Created Date</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("total_amount")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Amount</span>
                              {getSortIcon("total_amount")}
                            </div>
                          </TableHead>
                          <TableHead>Payment Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSales.map((sale) => (
                          <motion.tr key={sale.id} variants={itemVariants} className="border-b hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{sale.quote_number || sale.title || `Order #${sale.id.slice(0, 8)}`}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{getCustomerName(sale.customer)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(sale.status)}`}>
                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center text-gray-500">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{new Date(sale.created_at).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">${sale.total_amount?.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.payment_status)}`}>
                                {sale.payment_status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewOrder(sale)}
                                  title="View Order Details"
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                                
                                <OrderExportButton
                                  order={sale}
                                  customer={sale.customer}
                                  variant="ghost"
                                  size="icon"
                                />
                                
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="border-t p-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAndSortedSales.length}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <SaleFormDialog 
        open={isFormDialogOpen} 
        onOpenChange={setIsFormDialogOpen} 
        customers={customers} 
        onSubmit={handleFormSubmit} 
        saleToEdit={editingSale}
      />
      
      <OrderViewDialog
        open={!!viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
        order={viewOrder}
        customer={viewOrder?.customer}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
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