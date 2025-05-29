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
  UserCheck
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
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const CustomerFormDialog = ({ open, onOpenChange, customer, onSubmit, resetForm }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    contact_language: "english",
    customer_type: "end_client",
    bio: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        company_name: customer.company_name || "",
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        country: customer.country || "",
        address: customer.address || "",
        contact_language: customer.contact_language || "english",
        customer_type: customer.customer_type || "end_client",
        bio: customer.bio || ""
      });
    } else {
      setFormData({
        company_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "",
        address: "",
        contact_language: "english",
        customer_type: "end_client",
        bio: ""
      });
    }
  }, [customer, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace("edit-", "")]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ['company_name', 'first_name', 'last_name', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    if (resetForm) resetForm();
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information." : "Add a new customer to your database."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-company_name" : "company_name"}>Company Name *</Label>
              <Input
                id={customer ? "edit-company_name" : "company_name"}
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value) => handleSelectChange("customer_type", value)}
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-first_name" : "first_name"}>Contact Person First Name *</Label>
              <Input
                id={customer ? "edit-first_name" : "first_name"}
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-last_name" : "last_name"}>Contact Person Last Name *</Label>
              <Input
                id={customer ? "edit-last_name" : "last_name"}
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-email" : "email"}>Email *</Label>
              <Input
                id={customer ? "edit-email" : "email"}
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-phone" : "phone"}>Phone</Label>
              <Input
                id={customer ? "edit-phone" : "phone"}
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-country" : "country"}>Country</Label>
              <Input
                id={customer ? "edit-country" : "country"}
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Language</Label>
              <Select
                value={formData.contact_language}
                onValueChange={(value) => handleSelectChange("contact_language", value)}
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-address" : "address"}>Address</Label>
            <Input
              id={customer ? "edit-address" : "address"}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-bio" : "bio"}>Notes</Label>
            <Textarea
              id={customer ? "edit-bio" : "bio"}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Enter additional notes about this customer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{customer ? "Save Changes" : "Add Customer"}</Button>
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
      <DialogContent className="sm:max-w-[600px]">
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
                  <p>{item.value}</p>
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
                            <span>{item.title || `#${item.id.slice(0, 8)}`}</span>
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Get customers owned by the current user
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);

      if (customersError) throw customersError;

      // Get quotes for the user's customers
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id);

      if (quotesError) throw quotesError;

      // Get orders for the user's customers
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (ordersError) throw ordersError;

      setCustomers(customersData || []);
      setQuotes(quotesData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive"
      });
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...formData,
          user_id: user.id // Associate the customer with the current user
        }])
        .select()
        .single();

      if (error) throw error;

      loadData();
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
        const { error } = await supabase
          .from('customers')
          .update({
            ...formData,
            user_id: user.id // Ensure user_id is preserved on update
          })
          .eq('id', selectedCustomer.id)
          .eq('user_id', user.id); // Additional check to ensure ownership

        if (error) throw error;

        loadData();
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
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', selectedCustomer.id)
          .eq('user_id', user.id); // Additional check to ensure ownership

        if (error) throw error;

        loadData();
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

  const filteredCustomers = customers.filter(customer => 
    Object.values(customer).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};

  return (
    <div className="h-full flex flex-col">
      <Header title="Customer Management" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />Add Customer
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input className="pl-10 w-full sm:w-64" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <motion.tr key={customer.id} variants={itemVariants} className="border-b transition-colors hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-purple-500 mr-2" />
                              {`${customer.first_name} ${customer.last_name}`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.company_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-gray-400 mr-2" />
                              {customer.country}
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">No customers found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
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
            <DialogDescription>Are you sure? This action cannot be undone and may affect related data.</DialogDescription>
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