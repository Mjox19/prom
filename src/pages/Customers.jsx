import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Users, 
  Search, 
  Mail,
  Phone,
  MapPin,
  Trash2,
  Edit,
  User,
  FileText,
  TrendingUp,
  Building,
  Globe,
  Languages,
  UserCheck,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured, subscribeToTable } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const CustomerFormDialog = ({ open, onOpenChange, customer, onSubmit, resetForm }) => {
  const initialValues = {
    company_name: customer?.company_name || "",
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    country: customer?.country || "",
    address: customer?.address || "",
    contact_language: customer?.contact_language || "english",
    customer_type: customer?.customer_type || "end_client",
    bio: customer?.bio || ""
  };

  const rules = {
    company_name: [validationRules.required],
    first_name: [validationRules.required],
    last_name: [validationRules.required],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone]
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
    if (open) {
      if (customer) {
        Object.keys(initialValues).forEach(key => {
          setValue(key, customer[key] || initialValues[key]);
        });
      } else {
        reset();
      }
    }
  }, [customer, open]);

  const handleSubmit = () => {
    if (validateAll()) {
      onSubmit(values);
      if (resetForm) resetForm();
    }
  };

  const languages = [
    { value: "english", label: "English" },
    { value: "french", label: "French" },
    { value: "spanish", label: "Spanish" },
    { value: "dutch", label: "Dutch" }
  ];

  const customerTypes = [
    { value: "reseller", label: "Reseller" },
    { value: "end_client", label: "End Client" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information." : "Add a new customer to your database."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Company Name"
              required
              error={touched.company_name && errors.company_name}
              success={touched.company_name && !errors.company_name && values.company_name}
            >
              <Input
                value={values.company_name}
                onChange={(e) => setValue("company_name", e.target.value)}
                onBlur={() => setFieldTouched("company_name")}
                placeholder="Enter company name"
                className={touched.company_name && errors.company_name ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput label="Customer Type">
              <Select
                value={values.customer_type}
                onValueChange={(value) => setValue("customer_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  {customerTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="First Name"
              required
              error={touched.first_name && errors.first_name}
              success={touched.first_name && !errors.first_name && values.first_name}
            >
              <Input
                value={values.first_name}
                onChange={(e) => setValue("first_name", e.target.value)}
                onBlur={() => setFieldTouched("first_name")}
                placeholder="Enter first name"
                className={touched.first_name && errors.first_name ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput
              label="Last Name"
              required
              error={touched.last_name && errors.last_name}
              success={touched.last_name && !errors.last_name && values.last_name}
            >
              <Input
                value={values.last_name}
                onChange={(e) => setValue("last_name", e.target.value)}
                onBlur={() => setFieldTouched("last_name")}
                placeholder="Enter last name"
                className={touched.last_name && errors.last_name ? "border-red-500" : ""}
              />
            </ValidatedInput>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="Email"
              required
              error={touched.email && errors.email}
              success={touched.email && !errors.email && values.email}
            >
              <Input
                type="email"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value)}
                onBlur={() => setFieldTouched("email")}
                placeholder="Enter email"
                className={touched.email && errors.email ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput
              label="Phone"
              error={touched.phone && errors.phone}
              success={touched.phone && !errors.phone && values.phone}
            >
              <Input
                value={values.phone}
                onChange={(e) => setValue("phone", e.target.value)}
                onBlur={() => setFieldTouched("phone")}
                placeholder="Enter phone number"
                className={touched.phone && errors.phone ? "border-red-500" : ""}
              />
            </ValidatedInput>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput label="Country">
              <Input
                value={values.country}
                onChange={(e) => setValue("country", e.target.value)}
                placeholder="Enter country"
              />
            </ValidatedInput>
            
            <ValidatedInput label="Contact Language">
              <Select
                value={values.contact_language}
                onValueChange={(value) => setValue("contact_language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ValidatedInput>
          </div>

          <ValidatedInput label="Address">
            <Input
              value={values.address}
              onChange={(e) => setValue("address", e.target.value)}
              placeholder="Enter complete address"
            />
          </ValidatedInput>

          <ValidatedInput label="Notes">
            <Textarea
              value={values.bio}
              onChange={(e) => setValue("bio", e.target.value)}
              placeholder="Enter additional notes about this customer"
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
            {customer ? "Save Changes" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CustomerViewDialog = ({ open, onOpenChange, customer, quotes, orders }) => {
  if (!customer) return null;

  const fullName = `${customer.first_name} ${customer.last_name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{fullName}</h3>
              <p className="text-gray-500">{customer.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[
              { icon: Building, label: "Company", value: customer.company_name },
              { icon: Globe, label: "Country", value: customer.country },
              { icon: Languages, label: "Contact Language", value: customer.contact_language },
              { icon: Mail, label: "Email", value: customer.email },
              { icon: Phone, label: "Phone", value: customer.phone },
              { icon: MapPin, label: "Address", value: customer.address, span: true },
            ].map(item => (
              <div key={item.label} className={`flex items-start space-x-3 ${item.span ? "col-span-2" : ""}`}>
                <item.icon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                  <p>{item.value || 'N/A'}</p>
                </div>
              </div>
            ))}
            {customer.bio && (
              <div className="flex items-start space-x-3 col-span-2">
                <div className="shrink-0 w-5 h-5"></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-700">{customer.bio}</p>
                </div>
              </div>
            )}
          </div>
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-3">Activity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Quotes", items: quotes, Icon: FileText, color: "text-blue-500" },
                { title: "Orders", items: orders, Icon: TrendingUp, color: "text-green-500" },
              ].map(activity => (
                <div key={activity.title}>
                  <div className="flex items-center mb-2">
                    <activity.Icon className={`h-4 w-4 ${activity.color} mr-2`} />
                    <h5 className="font-medium">{activity.title}</h5>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {activity.items?.length > 0 ? (
                      <ul className="space-y-2">
                        {activity.items.map(item => (
                          <li key={item.id} className="text-sm flex justify-between">
                            <span>{item.quote_number || item.title || `#${item.id.slice(0, 8)}`}</span>
                            <span className={`status-badge status-${item.status}`}>{item.status}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No {activity.title.toLowerCase()} yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
      
      // Subscribe to real-time changes
      const unsubscribeCustomers = subscribeToTable(
        'customers',
        (payload) => {
          console.log('Customer change detected:', payload);
          loadData();
        }
      );

      const unsubscribeQuotes = subscribeToTable(
        'quotes',
        (payload) => {
          console.log('Quote change detected:', payload);
          loadData();
        }
      );

      const unsubscribeOrders = subscribeToTable(
        'orders',
        (payload) => {
          console.log('Order change detected:', payload);
          loadData();
        }
      );

      // Cleanup subscriptions
      return () => {
        unsubscribeCustomers();
        unsubscribeQuotes();
        unsubscribeOrders();
      };
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        // Use demo data when Supabase is not configured
        console.log('Using demo data - Supabase not configured');
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCustomers([
          {
            id: '1',
            company_name: 'Acme Corporation',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john@acme.com',
            phone: '555-123-4567',
            country: 'United States',
            address: '123 Business Ave, Suite 100, New York, NY 10001',
            contact_language: 'english',
            customer_type: 'end_client',
            bio: 'Large enterprise client with multiple departments',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            company_name: 'TechStart Inc.',
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah@techstart.io',
            phone: '555-987-6543',
            country: 'United States',
            address: '456 Innovation Blvd, San Francisco, CA 94107',
            contact_language: 'english',
            customer_type: 'end_client',
            bio: 'Startup with rapid growth, interested in premium services',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            company_name: 'Global Retail Solutions',
            first_name: 'Michael',
            last_name: 'Chen',
            email: 'michael@globalretail.com',
            phone: '555-456-7890',
            country: 'United States',
            address: '789 Commerce St, Chicago, IL 60611',
            contact_language: 'english',
            customer_type: 'reseller',
            bio: 'Retail chain looking for enterprise solutions',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
        setQuotes([]);
        setOrders([]);
        setLoading(false);
        return;
      }

      // Get all customers (RLS is disabled, so we get all customers)
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }

      // Get quotes for activity display
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
      }

      // Get orders for activity display
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      setCustomers(customersData || []);
      setQuotes(quotesData || []);
      setOrders(ordersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data. Using demo data instead.",
        variant: "destructive"
      });
      
      // Fallback to demo data
      setCustomers([
        {
          id: '1',
          company_name: 'Demo Company',
          first_name: 'Demo',
          last_name: 'Customer',
          email: 'demo@example.com',
          phone: '555-000-0000',
          country: 'Demo Country',
          address: 'Demo Address',
          contact_language: 'english',
          customer_type: 'end_client',
          bio: 'Demo customer for testing',
          created_at: new Date().toISOString()
        }
      ]);
      setQuotes([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo mode - just add to local state
        const newCustomer = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCustomers(prev => [newCustomer, ...prev]);
        setIsCreateDialogOpen(false);
        toast({ 
          title: "Customer Created (Demo Mode)", 
          description: "The customer has been added to demo data." 
        });
        return;
      }

      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setIsCreateDialogOpen(false);
      toast({ 
        title: "Customer Created", 
        description: "The customer has been successfully created." 
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async (formData) => {
    if (selectedCustomer) {
      try {
        if (!isSupabaseConfigured) {
          // Demo mode - just update local state
          setCustomers(prev => prev.map(customer => 
            customer.id === selectedCustomer.id 
              ? { ...customer, ...formData, updated_at: new Date().toISOString() }
              : customer
          ));
          setIsEditDialogOpen(false);
          setSelectedCustomer(null);
          toast({ 
            title: "Customer Updated (Demo Mode)", 
            description: "The customer has been updated in demo data." 
          });
          return;
        }

        const { data: updatedCustomer, error } = await supabase
          .from('customers')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id)
          .select()
          .single();

        if (error) throw error;

        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
        toast({ 
          title: "Customer Updated", 
          description: "The customer has been successfully updated." 
        });
      } catch (error) {
        console.error('Error updating customer:', error);
        toast({
          title: "Error",
          description: "Failed to update customer. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        if (!isSupabaseConfigured) {
          // Demo mode - just remove from local state
          setCustomers(prev => prev.filter(customer => customer.id !== selectedCustomer.id));
          setIsDeleteDialogOpen(false);
          setSelectedCustomer(null);
          toast({ 
            title: "Customer Deleted (Demo Mode)", 
            description: "The customer has been removed from demo data.", 
            variant: "destructive" 
          });
          return;
        }

        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', selectedCustomer.id);

        if (error) throw error;

        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
        toast({ 
          title: "Customer Deleted", 
          description: "The customer has been successfully deleted.", 
          variant: "destructive" 
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const openEditDialog = (customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleAddCustomer = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer => 
      Object.values(customer).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredAndSortedCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return <ArrowUpDown className={`h-4 w-4 ${sortDirection === "asc" ? "text-blue-500" : "text-blue-500 rotate-180"}`} />;
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};

  return (
    <div className="h-full flex flex-col">
      <Header title="Customer Management" />
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" onClick={handleAddCustomer}>
                  <Plus className="h-4 w-4 mr-2" />Add Customer
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                className="pl-10 w-full sm:w-64" 
                placeholder="Search customers..." 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }} 
              />
            </div>
          </div>
          
          {loading ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <TableSkeleton rows={5} columns={6} />
              </CardContent>
            </Card>
          ) : filteredAndSortedCustomers.length === 0 ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <EmptyState
                  icon={Users}
                  title="No customers found"
                  description={searchTerm ? 
                    `No customers match "${searchTerm}". Try adjusting your search terms or add a new customer.` :
                    "Add your first customer to get started. You can manage customer information, track their quotes and orders, and build lasting business relationships."
                  }
                  action={!searchTerm}
                  actionLabel="Add Customer"
                  onAction={handleAddCustomer}
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
                            onClick={() => handleSort("first_name")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Customer</span>
                              {getSortIcon("first_name")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("company_name")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Company</span>
                              {getSortIcon("company_name")}
                            </div>
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Phone</TableHead>
                          <TableHead className="hidden lg:table-cell">Country</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentCustomers.map((customer) => (
                          <motion.tr key={customer.id} variants={itemVariants} className="border-b transition-colors hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{`${customer.first_name} ${customer.last_name}`}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{customer.company_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{customer.phone || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{customer.country || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => openViewDialog(customer)} title="View Customer">
                                  <Users className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)} title="Edit Customer">
                                  <Edit className="h-4 w-4 text-amber-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setIsDeleteDialogOpen(true);}} title="Delete Customer">
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
                        totalItems={filteredAndSortedCustomers.length}
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
      
      <CustomerFormDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onSubmit={handleCreateSubmit} 
      />
      <CustomerFormDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        customer={selectedCustomer} 
        onSubmit={handleEditSubmit} 
      />
      <CustomerViewDialog 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
        customer={selectedCustomer} 
        quotes={quotes.filter(q => q.customer_id === selectedCustomer?.id)} 
        orders={orders.filter(o => o.customer_id === selectedCustomer?.id)} 
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone and may affect related quotes and orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;