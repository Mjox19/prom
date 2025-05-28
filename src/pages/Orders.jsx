import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, TrendingUp, Search, Filter, Calendar, Trash2, Edit, DollarSign, CheckCircle, XCircle, User,
  Package, Truck, MapPin, Clock, AlertTriangle
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
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const OrderFormDialog = ({ open, onOpenChange, customers, products, order, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    items: [{ productName: "", description: "", quantity: 1 }],
    shippingAddress: "",
    carrier: "fedex"
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customer_id,
        items: order.items.map(item => ({
          productName: item.product_name,
          description: item.product_description,
          quantity: item.quantity
        })),
        shippingAddress: order.shipping_address,
        carrier: order.delivery?.carrier || "fedex"
      });
    } else {
      setFormData({
        customerId: "",
        items: [{ productName: "", description: "", quantity: 1 }],
        shippingAddress: "",
        carrier: "fedex"
      });
    }
  }, [order, open]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: "", description: "", quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const carriers = [
    { id: "fedex", name: "FedEx" },
    { id: "ups", name: "UPS" },
    { id: "usps", name: "USPS" },
    { id: "dhl", name: "DHL" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{order ? "Edit Order" : "Create New Order"}</DialogTitle>
          <DialogDescription>
            {order ? "Update order details and items." : "Add a new order to track."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({...formData, customerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Carrier</Label>
              <Select
                value={formData.carrier}
                onValueChange={(value) => setFormData({...formData, carrier: value})}
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
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shipping Address</Label>
            <Input
              value={formData.shippingAddress}
              onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
              placeholder="Enter shipping address"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />Add Item
              </Button>
            </div>
            {formData.items.map((item, index) => (
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
                  {formData.items.length > 1 && (
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
          <Button onClick={() => onSubmit(formData)}>
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
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
      subscribeToOrders();
    }
  }, [user]);

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev =>
              prev.map(order => order.id === payload.new.id ? payload.new : order)
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadData = async () => {
    try {
      // Fetch orders with their delivery information
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
          delivery:deliveries(*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*');

      if (customersError) throw customersError;
      setCustomers(customersData);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateOrder = async (formData) => {
    try {
      // Calculate prices based on quantity
      const orderItems = formData.items.map(item => ({
        product_name: item.productName,
        product_description: item.description,
        quantity: item.quantity,
        unit_price: 0, // You might want to set this based on your business logic
        total_price: 0 // This would be calculated based on unit_price * quantity
      }));

      const totalAmount = 0; // Calculate based on your business logic

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: formData.customerId,
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

      // Create delivery record
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert([{
          order_id: order.id,
          status: 'pending',
          carrier: formData.carrier,
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (deliveryError) throw deliveryError;

      setIsFormDialogOpen(false);
      toast({
        title: "Order Created",
        description: "New order has been created successfully."
      });
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
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}.`
      });
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
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status.",
        variant: "destructive"
      });
    }
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
    return customer ? customer.name : 'Unknown';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 }}
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Orders & Deliveries" />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Button
              onClick={() => setIsFormDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <motion.tr
                          key={order.id}
                          variants={itemVariants}
                          className="border-b hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-purple-500 mr-2" />
                              #{order.id.slice(0, 8)}
                            </div>
                          </TableCell>
                          <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <span className={`status-badge status-${order.status}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.delivery ? (
                              <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4 text-blue-500" />
                                <span className={`status-badge status-${order.delivery.status}`}>
                                  {order.delivery.status.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No delivery info</span>
                            )}
                          </TableCell>
                          <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
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
                              {order.delivery && order.delivery.status !== 'delivered' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleUpdateDeliveryStatus(order.delivery.id, 'delivered')}
                                  title="Mark Delivery as Complete"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No orders found.
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

      <OrderFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        customers={customers}
        order={selectedOrder}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};

export default Orders;