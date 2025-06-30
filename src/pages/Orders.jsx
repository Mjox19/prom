import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, TrendingUp, Search, Filter, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle, User,
  Package, Truck, MapPin, Clock, AlertTriangle, Bell, ArrowUpDown, Eye, Download
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured, subscribeToTable, generateQuoteNumber } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/lib/notificationService";
import OrderViewDialog from "@/components/orders/OrderViewDialog";
import OrderExportButton from "@/components/orders/OrderExportButton";

const OrderFormDialog = ({ open, onOpenChange, customers, products, order, onSubmit }) => {
  const initialValues = {
    customerId: order?.customer_id || "",
    items: order?.items?.map(item => ({
      productName: item.product_name || "",
      description: item.product_description || "",
      quantity: item.quantity || 1
    })) || [{ productName: "", description: "", quantity: 1 }],
    shippingAddress: order?.shipping_address || "",
    carrier: order?.delivery && order.delivery.length > 0 ? order.delivery[0].carrier : "fedex"
  };

  const rules = {
    customerId: [validationRules.required],
    shippingAddress: [validationRules.required]
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
    if (order) {
      Object.keys(initialValues).forEach(key => {
        setValue(key, initialValues[key]);
      });
    } else {
      reset();
    }
  }, [order, open]);

  const handleAddItem = () => {
    setValue("items", [...values.items, { productName: "", description: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setValue("items", values.items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = values.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setValue("items", updatedItems);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      onSubmit(values);
    }
  };

  const carriers = [
    { id: "fedex", name: "FedEx" },
    { id: "ups", name: "UPS" },
    { id: "usps", name: "USPS" },
    { id: "dhl", name: "DHL" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {order ? "Update order details and items." : "Add a new order to track."}
          </DialogDescription>
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
                onValueChange={(value) => {
                  setValue("customerId", value);
                  setFieldTouched("customerId");
                }}
              >
                <SelectTrigger className={touched.customerId && errors.customerId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name || `${customer.first_name} ${customer.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
            
            <ValidatedInput label="Carrier">
              <Select
                value={values.carrier}
                onValueChange={(value) => setValue("carrier", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrier => (
                    <SelectItem key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
          </div>

          <ValidatedInput
            label="Shipping Address"
            required
            error={touched.shippingAddress && errors.shippingAddress}
            success={touched.shippingAddress && !errors.shippingAddress && values.shippingAddress}
          >
            <Input
              value={values.shippingAddress}
              onChange={(e) => setValue("shippingAddress", e.target.value)}
              onBlur={() => setFieldTouched("shippingAddress")}
              placeholder="Enter shipping address"
              className={touched.shippingAddress && errors.shippingAddress ? "border-red-500" : ""}
            />
          </ValidatedInput>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />Add Item
              </Button>
            </div>
            {values.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-6">
                  <Label className="text-xs">Product Name</Label>
                  <Input
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-11"></div>
                <div className="col-span-1 flex justify-end">
                  {values.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid && Object.keys(touched).length > 0}
          >
            {order ? "Update Order" : "Create Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
      
      // Request notification permission
      notificationService.requestNotificationPermission();
      
      // Subscribe to real-time changes
      const unsubscribeOrders = subscribeToTable(
        'orders',
        (payload) => {
          console.log('Order change detected:', payload);
          loadData();
        }
      );

      const unsubscribeDeliveries = subscribeToTable(
        'deliveries',
        (payload) => {
          console.log('Delivery change detected:', payload);
          loadData();
        }
      );

      const unsubscribeCustomers = subscribeToTable(
        'customers',
        (payload) => {
          console.log('Customer change detected:', payload);
          loadData();
        }
      );

      // Cleanup subscriptions
      return () => {
        unsubscribeOrders();
        unsubscribeDeliveries();
        unsubscribeCustomers();
      };
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Use demo data when Supabase is not configured
        console.log('Using demo data - Supabase not configured');
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setOrders([
          {
            id: '1',
            quote_number: 'QT-2025-000001',
            customer_id: '1',
            status: 'pending',
            total_amount: 5000,
            shipping_address: '123 Demo St, Demo City, DC 12345',
            tracking_number: 'DEMO123456',
            created_at: new Date().toISOString(),
            items: [
              { id: '1', product_name: 'Demo Product', product_description: 'Demo Description', quantity: 2, unit_price: 2500, total_price: 5000 }
            ],
            delivery: [
              { id: '1', status: 'pending', carrier: 'fedex', estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
            ]
          }
        ]);
        
        setCustomers([
          {
            id: '1',
            company_name: 'Demo Company',
            first_name: 'Demo',
            last_name: 'Customer',
            email: 'demo@example.com',
            contact_language: 'english'
          }
        ]);
        
        setLoading(false);
        return;
      }

      // Fetch orders with their delivery information and customer details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            id,
            product_name,
            product_description,
            quantity,
            unit_price,
            total_price
          ),
          delivery:deliveries(*),
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch all customers for the form dropdown
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('company_name', { ascending: true });

      if (customersError) throw customersError;
      setCustomers(customersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (formData) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        const newQuoteNumber = generateQuoteNumber();
        const newOrder = {
          id: Date.now().toString(),
          quote_number: newQuoteNumber,
          customer_id: formData.customerId,
          status: 'pending',
          total_amount: 0,
          shipping_address: formData.shippingAddress,
          created_at: new Date().toISOString(),
          items: formData.items.map((item, index) => ({
            id: `${Date.now()}-${index}`,
            product_name: item.productName,
            product_description: item.description,
            quantity: item.quantity,
            unit_price: 100,
            total_price: item.quantity * 100
          })),
          delivery: [{
            id: `del-${Date.now()}`,
            status: 'pending',
            carrier: formData.carrier,
            estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }]
        };
        
        setOrders(prev => [newOrder, ...prev]);
        setIsFormDialogOpen(false);
        toast({
          title: "Order Created (Demo Mode)",
          description: `Order ${newQuoteNumber} has been created in demo data.`
        });
        return;
      }

      // Generate a new quote number for the order
      const newQuoteNumber = generateQuoteNumber();

      // Calculate prices based on quantity
      const orderItems = formData.items.map(item => ({
        product_name: item.productName,
        product_description: item.description,
        quantity: item.quantity,
        unit_price: 100, // You might want to set this based on your business logic
        total_price: item.quantity * 100 // This would be calculated based on unit_price * quantity
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          quote_number: newQuoteNumber,
          customer_id: formData.customerId,
          user_id: user.id,
          status: 'pending',
          total_amount: totalAmount,
          shipping_address: formData.shippingAddress
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderItems.map(item => ({
            order_id: order.id,
            ...item
          }))
        );

      if (itemsError) throw itemsError;

      // Create delivery record with the same quote number
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert([{
          order_id: order.id,
          quote_number: newQuoteNumber,
          status: 'pending',
          carrier: formData.carrier,
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (deliveryError) throw deliveryError;

      // Get customer for notification
      const customer = customers.find(c => c.id === formData.customerId);
      if (customer) {
        // Send order creation notification
        await notificationService.handleOrderStatusChange(
          order,
          'created',
          'pending',
          customer,
          user
        );
      }

      setIsFormDialogOpen(false);
      
      toast({
        title: "Order Created",
        description: `Order ${newQuoteNumber} has been created successfully.`
      });
      
      loadData(); // Reload data to get the updated orders
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const oldStatus = order.status;

      if (!isSupabaseConfigured) {
        // Demo mode
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
            : o
        ));
        
        toast({
          title: "Status Updated (Demo Mode)",
          description: `Order status updated to ${newStatus} in demo data.`
        });
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Get customer for notification
      const customer = order.customer || customers.find(c => c.id === order.customer_id);
      if (customer && oldStatus !== newStatus) {
        // Send status change notification
        await notificationService.handleOrderStatusChange(
          order,
          oldStatus,
          newStatus,
          customer,
          user
        );
      }

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}.`
      });
      
      loadData(); // Reload data to get the updated orders
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode
        setOrders(prev => prev.map(o => {
          if (o.delivery && o.delivery.length > 0 && o.delivery[0].id === deliveryId) {
            return {
              ...o,
              delivery: [{
                ...o.delivery[0],
                status: newStatus,
                actual_delivery: newStatus === 'delivered' ? new Date().toISOString() : null
              }]
            };
          }
          return o;
        }));
        
        toast({
          title: "Delivery Updated (Demo Mode)",
          description: `Delivery status updated to ${newStatus} in demo data.`
        });
        return;
      }

      const { error } = await supabase
        .from('deliveries')
        .update({ 
          status: newStatus,
          actual_delivery: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', deliveryId);

      if (error) throw error;

      toast({
        title: "Delivery Updated",
        description: `Delivery status updated to ${newStatus}.`
      });
      
      loadData(); // Reload data to get the updated deliveries
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status.",
        variant: "destructive"
      });
    }
  };

  const handleSendDeliveryReminder = async (order) => {
    try {
      const delivery = order.delivery?.[0];
      const customer = order.customer || customers.find(c => c.id === order.customer_id);
      
      if (!delivery || !customer) {
        toast({
          title: "Error",
          description: "Missing delivery or customer information.",
          variant: "destructive"
        });
        return;
      }

      await notificationService.handleDeliveryReminder(delivery, order, customer, user);
      
      toast({
        title: "Reminder Sent",
        description: `Delivery reminder sent to ${customer.email}`,
      });
    } catch (error) {
      console.error('Error sending delivery reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send delivery reminder.",
        variant: "destructive"
      });
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? (customer.company_name || `${customer.first_name} ${customer.last_name}`) : 'Unknown';
  };

  const getCustomer = (customerId) => {
    return customers.find(c => c.id === customerId);
  };

  const isDeliveryUpcoming = (delivery) => {
    if (!delivery?.estimated_delivery) return false;
    const deliveryDate = new Date(delivery.estimated_delivery);
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    const today = new Date();
    return deliveryDate >= today && deliveryDate <= fiveDaysFromNow;
  };

  const handleViewOrder = (order) => {
    setViewOrder(order);
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      const customer = order.customer || customers.find(c => c.id === order.customer_id);
      const customerName = customer ? (customer.company_name || `${customer.first_name} ${customer.last_name}`) : '';
      
      const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.quote_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'customer_name') {
        const aCustomer = a.customer || customers.find(c => c.id === a.customer_id);
        const bCustomer = b.customer || customers.find(c => c.id === b.customer_id);
        aValue = aCustomer ? (aCustomer.company_name || `${aCustomer.first_name} ${aCustomer.last_name}`) : '';
        bValue = bCustomer ? (bCustomer.company_name || `${bCustomer.first_name} ${bCustomer.last_name}`) : '';
      }
      
      if (sortDirection === "asc") {
        return String(aValue || '').localeCompare(String(bValue || ''));
      } else {
        return String(bValue || '').localeCompare(String(aValue || ''));
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 }}
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Orders & Deliveries" />
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
      <Header title="Orders & Deliveries" />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <Button
              onClick={() => setIsFormDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />Create Order
            </Button>
            
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAndSortedOrders.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <EmptyState
                  icon={Package}
                  title="No orders found"
                  description={searchTerm || statusFilter ? 
                    "No orders match your current filters. Try adjusting your search criteria." :
                    "No orders found. Create your first order or convert a quote to an order to get started."
                  }
                  action={!searchTerm && !statusFilter}
                  actionLabel="Create Order"
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
                          <TableHead className="hidden md:table-cell">Delivery Status</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("total_amount")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Total Amount</span>
                              {getSortIcon("total_amount")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none hidden lg:table-cell"
                            onClick={() => handleSort("created_at")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Created At</span>
                              {getSortIcon("created_at")}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrders.map((order) => {
                          const delivery = order.delivery?.[0];
                          const isUpcoming = delivery && isDeliveryUpcoming(delivery);
                          const customer = order.customer || customers.find(c => c.id === order.customer_id);
                          
                          return (
                            <motion.tr
                              key={order.id}
                              variants={itemVariants}
                              className="border-b hover:bg-gray-50"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                                  <span className="truncate">{order.quote_number || `#${order.id.slice(0, 8)}`}</span>
                                  {isUpcoming && (
                                    <Bell className="h-4 w-4 text-amber-500 ml-2 flex-shrink-0" title="Delivery upcoming in 5 days" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate">{getCustomerName(order.customer_id)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(order.status)}
                                  <span className={`status-badge status-${order.status}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {delivery ? (
                                  <div className="flex items-center space-x-2">
                                    <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className={`status-badge status-${delivery.status}`}>
                                      {(delivery.status || '').split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No delivery info</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">${order.total_amount?.toLocaleString() || '0'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewOrder(order)}
                                    title="View Order Details"
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" />
                                  </Button>
                                  
                                  <OrderExportButton
                                    order={order}
                                    customer={customer}
                                    variant="ghost"
                                    size="icon"
                                  />
                                  
                                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                    <>
                                      {order.status === 'pending' && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                          title="Start Processing"
                                        >
                                          <Package className="h-4 w-4 text-blue-500" />
                                        </Button>
                                      )}
                                      {order.status === 'processing' && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                          title="Mark as Shipped"
                                        >
                                          <Truck className="h-4 w-4 text-purple-500" />
                                        </Button>
                                      )}
                                      {order.status === 'shipped' && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                          title="Mark as Delivered"
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                        title="Cancel Order"
                                      >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                                  {delivery && delivery.status !== 'delivered' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleUpdateDeliveryStatus(delivery.id, 'delivered')}
                                      title="Mark Delivery as Complete"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
                                  {delivery && isUpcoming && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSendDeliveryReminder(order)}
                                      title="Send Delivery Reminder"
                                    >
                                      <Bell className="h-4 w-4 text-amber-500" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
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
                        totalItems={filteredAndSortedOrders.length}
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

      <OrderFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        customers={customers}
        order={selectedOrder}
        onSubmit={handleCreateOrder}
      />

      <OrderViewDialog
        open={!!viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
        order={viewOrder}
        customer={viewOrder?.customer || customers.find(c => c?.id === viewOrder?.customer_id)}
      />
    </div>
  );
};

export default Orders;