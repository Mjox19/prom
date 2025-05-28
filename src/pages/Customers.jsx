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
  TrendingUp
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
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "@/lib/customerData";
import { getQuotes } from "@/lib/quoteData";
import { getSales } from "@/lib/saleData";

const CustomerFormDialog = ({ open, onOpenChange, customer, onSubmit, resetForm }) => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", contactPerson: "", notes: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({ name: "", email: "", phone: "", address: "", contactPerson: "", notes: "" });
    }
  }, [customer, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace("edit-", "")]: value }));
  };
  
  const handleSubmit = () => {
    onSubmit(formData);
    if (resetForm) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information." : "Add a new customer to your database."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-name" : "name"}>Company Name</Label>
            <Input id={customer ? "edit-name" : "name"} value={formData.name} onChange={handleChange} placeholder="Enter company name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-email" : "email"}>Email</Label>
              <Input id={customer ? "edit-email" : "email"} type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={customer ? "edit-phone" : "phone"}>Phone</Label>
              <Input id={customer ? "edit-phone" : "phone"} value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-address" : "address"}>Address</Label>
            <Input id={customer ? "edit-address" : "address"} value={formData.address} onChange={handleChange} placeholder="Enter address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-contactPerson" : "contactPerson"}>Contact Person</Label>
            <Input id={customer ? "edit-contactPerson" : "contactPerson"} value={formData.contactPerson} onChange={handleChange} placeholder="Enter contact person name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={customer ? "edit-notes" : "notes"}>Notes</Label>
            <Textarea id={customer ? "edit-notes" : "notes"} value={formData.notes} onChange={handleChange} placeholder="Enter notes about this customer" />
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

const CustomerViewDialog = ({ open, onOpenChange, customer, quotes, sales }) => {
  if (!customer) return null;
  const customerQuotes = quotes.filter(q => q.customerId === customer.id);
  const customerSales = sales.filter(s => s.customerId === customer.id);

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
              <h3 className="text-xl font-bold">{customer.name}</h3>
              <p className="text-gray-500">{customer.contactPerson}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[
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
            {customer.notes && (
              <div className="flex items-start space-x-3 col-span-2">
                <div className="shrink-0 w-5 h-5"></div> {/* Spacer for alignment */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-700">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-3">Activity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Quotes", items: customerQuotes, Icon: FileText, color: "text-blue-500" },
                { title: "Sales", items: customerSales, Icon: TrendingUp, color: "text-green-500" },
              ].map(activity => (
                <div key={activity.title}>
                  <div className="flex items-center mb-2">
                    <activity.Icon className={`h-4 w-4 ${activity.color} mr-2`} />
                    <h5 className="font-medium">{activity.title}</h5>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {activity.items.length > 0 ? (
                      <ul className="space-y-2">
                        {activity.items.map(item => (
                          <li key={item.id} className="text-sm flex justify-between">
                            <span>{item.title}</span>
                            <span className={`status-badge status-${item.status}`}>{item.status}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (<p className="text-sm text-gray-500">No {activity.title.toLowerCase()} yet</p>)}
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
  const [customers, setCustomersState] = useState([]);
  const [quotes, setQuotesState] = useState([]);
  const [sales, setSalesState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setCustomersState(getCustomers());
    setQuotesState(getQuotes());
    setSalesState(getSales());
  };

  const handleCreateSubmit = (formData) => {
    addCustomer(formData);
    loadData();
    setIsCreateDialogOpen(false);
    toast({ title: "Customer created", description: "The customer has been successfully created." });
  };

  const handleEditSubmit = (formData) => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, formData);
      loadData();
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      toast({ title: "Customer updated", description: "The customer has been successfully updated." });
    }
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      loadData();
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      toast({ title: "Customer deleted", description: "The customer has been successfully deleted.", variant: "destructive" });
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
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <motion.tr key={customer.id} variants={itemVariants} className="border-b transition-colors hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center"><User className="h-4 w-4 text-purple-500 mr-2" />{customer.name}</div>
                          </TableCell>
                          <TableCell>{customer.contactPerson}</TableCell>
                          <TableCell>
                            <div className="flex items-center"><Mail className="h-4 w-4 text-gray-400 mr-2" />{customer.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center"><Phone className="h-4 w-4 text-gray-400 mr-2" />{customer.phone}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => openViewDialog(customer)} title="View Customer"><Users className="h-4 w-4 text-blue-500" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)} title="Edit Customer"><Edit className="h-4 w-4 text-amber-500" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setIsDeleteDialogOpen(true);}} title="Delete Customer"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No customers found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <CustomerFormDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateSubmit} />
      <CustomerFormDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} customer={selectedCustomer} onSubmit={handleEditSubmit} />
      <CustomerViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} customer={selectedCustomer} quotes={quotes} sales={sales} />

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