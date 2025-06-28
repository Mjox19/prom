import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw, 
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  Server,
  User,
  FileText,
  Clock,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import fs from 'fs/promises';
import path from 'path';

// Email View Dialog Component
const EmailViewDialog = ({ open, onOpenChange, email }) => {
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
          <DialogDescription>
            Sent on {new Date(email.date || email.receivedAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">From</Label>
              <div className="p-2 bg-gray-50 rounded-md text-sm">{email.from}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">To</Label>
              <div className="p-2 bg-gray-50 rounded-md text-sm">{email.to}</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm text-gray-500">Subject</Label>
            <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">{email.subject}</div>
          </div>
          
          {email.attachments && email.attachments.length > 0 && (
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">Attachments</Label>
              <div className="p-2 bg-gray-50 rounded-md">
                <ul className="text-sm space-y-1">
                  {email.attachments.map((att, index) => (
                    <li key={index} className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      {att.filename} ({att.contentType}, {Math.round(att.size / 1024)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Label className="text-sm text-gray-500">Content</Label>
            <div className="border rounded-md overflow-hidden">
              <Tabs defaultValue="html">
                <TabsList className="bg-gray-100 border-b p-0">
                  <TabsTrigger value="html" className="px-4 py-2">HTML</TabsTrigger>
                  <TabsTrigger value="text" className="px-4 py-2">Plain Text</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="p-0">
                  <iframe
                    srcDoc={email.html}
                    className="w-full h-[400px] border-0"
                    title="Email HTML Content"
                  />
                </TabsContent>
                <TabsContent value="text" className="p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-md">
                    {email.text}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// SMTP Settings Dialog Component
const SmtpSettingsDialog = ({ open, onOpenChange, onSave, currentSettings }) => {
  const initialValues = {
    host: currentSettings?.host || 'localhost',
    port: currentSettings?.port || 2525,
    secure: currentSettings?.secure || false,
    auth: currentSettings?.auth || false,
    username: currentSettings?.username || '',
    password: currentSettings?.password || '',
    from: currentSettings?.from || 'sales@promocups.com',
    fromName: currentSettings?.fromName || 'Promocups Sales'
  };

  const rules = {
    host: [validationRules.required],
    port: [validationRules.required, validationRules.number],
    from: [validationRules.required, validationRules.email],
    fromName: [validationRules.required]
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched: setFieldTouched,
    validateAll,
    isValid
  } = useFormValidation(initialValues, rules);

  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!validateAll()) return;
    
    setIsTesting(true);
    setTestStatus(null);
    
    try {
      // Simulate testing the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, we would test the connection here
      // For now, we'll just simulate success
      setTestStatus({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestStatus({ success: false, message: error.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (validateAll()) {
      onSave(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>SMTP Server Settings</DialogTitle>
          <DialogDescription>
            Configure the SMTP server for sending emails
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="SMTP Host"
              required
              error={touched.host && errors.host}
              success={touched.host && !errors.host && values.host}
            >
              <Input
                value={values.host}
                onChange={(e) => setValue("host", e.target.value)}
                onBlur={() => setFieldTouched("host")}
                placeholder="smtp.example.com"
                className={touched.host && errors.host ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput
              label="SMTP Port"
              required
              error={touched.port && errors.port}
              success={touched.port && !errors.port && values.port}
            >
              <Input
                type="number"
                value={values.port}
                onChange={(e) => setValue("port", parseInt(e.target.value) || '')}
                onBlur={() => setFieldTouched("port")}
                placeholder="587"
                className={touched.port && errors.port ? "border-red-500" : ""}
              />
            </ValidatedInput>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Secure Connection (TLS/SSL)</Label>
              <Select
                value={values.secure.toString()}
                onValueChange={(value) => setValue("secure", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes (TLS/SSL)</SelectItem>
                  <SelectItem value="false">No (Unencrypted)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Authentication Required</Label>
              <Select
                value={values.auth.toString()}
                onValueChange={(value) => setValue("auth", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {values.auth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput label="Username">
                <Input
                  value={values.username}
                  onChange={(e) => setValue("username", e.target.value)}
                  placeholder="SMTP username"
                />
              </ValidatedInput>
              
              <ValidatedInput label="Password">
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => setValue("password", e.target.value)}
                  placeholder="SMTP password"
                />
              </ValidatedInput>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              label="From Email"
              required
              error={touched.from && errors.from}
              success={touched.from && !errors.from && values.from}
            >
              <Input
                value={values.from}
                onChange={(e) => setValue("from", e.target.value)}
                onBlur={() => setFieldTouched("from")}
                placeholder="noreply@promocups.com"
                className={touched.from && errors.from ? "border-red-500" : ""}
              />
            </ValidatedInput>
            
            <ValidatedInput
              label="From Name"
              required
              error={touched.fromName && errors.fromName}
              success={touched.fromName && !errors.fromName && values.fromName}
            >
              <Input
                value={values.fromName}
                onChange={(e) => setValue("fromName", e.target.value)}
                onBlur={() => setFieldTouched("fromName")}
                placeholder="Promocups Sales"
                className={touched.fromName && errors.fromName ? "border-red-500" : ""}
              />
            </ValidatedInput>
          </div>
          
          {testStatus && (
            <div className={`p-3 rounded-md ${testStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                {testStatus.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${testStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testStatus.success ? 'Connection Successful' : 'Connection Failed'}
                  </p>
                  <p className={`text-sm ${testStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isTesting || !isValid}
            className="w-full sm:w-auto"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Server className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isValid}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Email Admin Component
const EmailAdmin = () => {
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [smtpSettings, setSmtpSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, userProfile, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (user && isSuperAdmin()) {
      loadEmails();
      loadSmtpSettings();
    } else {
      setLoading(false);
    }
  }, [user, userProfile]);

  const loadEmails = async () => {
    try {
      setLoading(true);

      // In a real implementation, we would fetch emails from the database
      // For now, we'll generate some demo data
      const demoEmails = generateDemoEmails(50);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmails(demoEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
      toast({
        title: "Error",
        description: "Failed to load email data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSmtpSettings = async () => {
    try {
      // In a real implementation, we would fetch SMTP settings from the database
      // For now, we'll use demo settings
      const demoSettings = {
        host: 'localhost',
        port: 2525,
        secure: false,
        auth: false,
        username: '',
        password: '',
        from: 'sales@promocups.com',
        fromName: 'Promocups Sales'
      };
      
      setSmtpSettings(demoSettings);
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast({
        title: "Error",
        description: "Failed to load SMTP settings.",
        variant: "destructive"
      });
    }
  };

  const handleSaveSmtpSettings = async (settings) => {
    try {
      // In a real implementation, we would save the settings to the database
      // For now, we'll just update the local state
      setSmtpSettings(settings);
      setIsSettingsDialogOpen(false);
      
      toast({
        title: "Settings Saved",
        description: "SMTP settings have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP settings.",
        variant: "destructive"
      });
    }
  };

  const handleViewEmail = (email) => {
    setSelectedEmail(email);
    setIsViewDialogOpen(true);
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
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'order':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivery':
        return <Mail className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter and sort emails
  const filteredAndSortedEmails = emails
    .filter(email => {
      const matchesSearch = (email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.from?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter ? email.status === statusFilter : true;
      const matchesType = typeFilter ? email.type === typeFilter : true;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle date comparison
      if (sortField === 'date') {
        aValue = new Date(a.date || a.receivedAt).getTime();
        bValue = new Date(b.date || b.receivedAt).getTime();
      }
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmails = filteredAndSortedEmails.slice(startIndex, endIndex);

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

  // Generate demo emails for testing
  const generateDemoEmails = (count) => {
    const types = ['quote', 'order', 'delivery', 'system'];
    const statuses = ['sent', 'failed', 'pending'];
    const subjects = [
      'Quote #QT-2025-000123 for Acme Corp',
      'Order Confirmation #ORD-2025-000456',
      'Delivery Reminder for Order #ORD-2025-000789',
      'Your Quote Has Been Accepted',
      'Order Status Update: Processing',
      'Important: Delivery Scheduled for Tomorrow'
    ];
    
    return Array.from({ length: count }).map((_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      return {
        id: `email-${index + 1}`,
        from: 'sales@promocups.com',
        to: `customer${index + 1}@example.com`,
        subject,
        text: `This is a demo email for ${type}. Status: ${status}`,
        html: `<div><h2>${subject}</h2><p>This is a demo email for ${type}.</p><p>Status: ${status}</p></div>`,
        type,
        status,
        date: date.toISOString(),
        attachments: type === 'quote' ? [{ 
          filename: `quote-${index + 1}.pdf`, 
          contentType: 'application/pdf',
          size: Math.floor(Math.random() * 500000) + 100000
        }] : []
      };
    });
  };

  // Check if user has permission to access this page
  if (!isSuperAdmin()) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Email Administration" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access the email administration panel.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header title="Email Administration" />
        <div className="flex-1 p-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <TableSkeleton rows={5} columns={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title="Email Administration" />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          {/* Stats Cards */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Emails</p>
                      <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Sent Successfully</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {emails.filter(e => e.status === 'sent').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {emails.filter(e => e.status === 'failed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* SMTP Settings Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>SMTP Server Configuration</CardTitle>
                  <CardDescription>Configure email sending settings</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsSettingsDialogOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">SMTP Host</Label>
                    <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                      {smtpSettings?.host || 'localhost'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">SMTP Port</Label>
                    <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                      {smtpSettings?.port || '2525'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">From Email</Label>
                    <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                      {smtpSettings?.from || 'sales@promocups.com'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Security</Label>
                    <div className="p-2 bg-gray-50 rounded-md text-sm font-medium">
                      {smtpSettings?.secure ? 'TLS/SSL' : 'None'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10 w-full sm:w-64 bg-white"
                  placeholder="Search emails..."
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
                <SelectTrigger className="w-full sm:w-40 bg-white">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-40 bg-white">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={loadEmails}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Emails Table */}
          {filteredAndSortedEmails.length === 0 ? (
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-0">
                <EmptyState
                  icon={Mail}
                  title="No emails found"
                  description={searchTerm || statusFilter || typeFilter ? 
                    "No emails match your current filters. Try adjusting your search criteria." :
                    "No emails found in the system."
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("subject")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Subject</span>
                              {getSortIcon("subject")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("to")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Recipient</span>
                              {getSortIcon("to")}
                            </div>
                          </TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort("date")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Date</span>
                              {getSortIcon("date")}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentEmails.map((email) => (
                          <motion.tr
                            key={email.id}
                            variants={itemVariants}
                            className="border-b hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{email.subject}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{email.to}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getTypeIcon(email.type)}
                                <span className="ml-2 capitalize">{email.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getStatusIcon(email.status)}
                                <span className={`ml-2 capitalize ${
                                  email.status === 'sent' ? 'text-green-600' : 
                                  email.status === 'failed' ? 'text-red-600' : 
                                  'text-yellow-600'
                                }`}>
                                  {email.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-gray-500">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {new Date(email.date || email.receivedAt).toLocaleDateString()} {new Date(email.date || email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewEmail(email)}
                                  title="View Email"
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                                {email.attachments && email.attachments.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Download Attachments"
                                  >
                                    <Download className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
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
                        totalItems={filteredAndSortedEmails.length}
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

      <EmailViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        email={selectedEmail}
      />

      <SmtpSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        onSave={handleSaveSmtpSettings}
        currentSettings={smtpSettings}
      />
    </div>
  );
};

export default EmailAdmin;