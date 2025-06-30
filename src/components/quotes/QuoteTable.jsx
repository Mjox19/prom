import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, Calendar, Edit, Send, CheckCircle, XCircle, Trash2, 
  MoreVertical, Bell, ShoppingCart, Loader2, Plus, Download, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuoteExportButton from "./QuoteExportButton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const QuoteTable = ({ 
  quotes, 
  customers, 
  onEdit, 
  onUpdateStatus, 
  onConvertToSale, 
  onDelete, 
  onSendReminder, 
  sendingReminder,
  loading = false,
  onCreateQuote
}) => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 }}};
  const [viewQuote, setViewQuote] = React.useState(null);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name} - ${customer.company_name}` : "Unknown";
  };

  const getCustomer = (customerId) => {
    return customers.find(c => c.id === customerId);
  };

  const handleStatusChange = (quoteId, newStatus) => {
    onUpdateStatus(quoteId, newStatus);
    
    if (newStatus === 'ordered') {
      onConvertToSale(quoteId);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'declined', label: 'Declined' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'expired', label: 'Expired' }
    ];
    
    return allStatuses;
  };

  const handleViewQuote = (quote) => {
    setViewQuote(quote);
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <TableSkeleton rows={5} columns={6} />
        </CardContent>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={FileText}
            title="No quotes found"
            description="Create your first quote to begin managing your sales opportunities. You can track quote status, send reminders, and convert quotes to orders."
            action={!!onCreateQuote}
            actionLabel="Create Quote"
            onAction={onCreateQuote}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <motion.tr key={quote.id} variants={itemVariants} className="border-b hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        <span className="truncate">{quote.quote_number || quote.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="truncate">{getCustomerName(quote.customer_id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{new Date(quote.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="truncate">${quote.total?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={quote.status}
                        onValueChange={(value) => handleStatusChange(quote.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>
                            <span className={`status-badge status-${quote.status}`}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(quote.status).map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewQuote(quote)} title="View Quote">
                          <Eye className="h-4 w-4 text-blue-500" />
                        </Button>
                        
                        <Button variant="ghost" size="icon" onClick={() => onEdit(quote)} title="Edit Quote">
                          <Edit className="h-4 w-4 text-amber-500" />
                        </Button>
                        
                        <QuoteExportButton 
                          quote={quote} 
                          customer={getCustomer(quote.customer_id)} 
                          variant="ghost" 
                          size="icon" 
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(quote.status === 'sent' || quote.status === 'accepted') && (
                              <DropdownMenuItem 
                                onClick={() => onSendReminder(quote)}
                                disabled={sendingReminder}
                              >
                                {sendingReminder ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Bell className="h-4 w-4 mr-2" />
                                )}
                                Send Email Reminder
                              </DropdownMenuItem>
                            )}
                            {quote.status === 'accepted' && (
                              <DropdownMenuItem onClick={() => onConvertToSale(quote.id)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Convert to Order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDelete(quote)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quote View Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={(open) => !open && setViewQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewQuote && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{viewQuote.title || `Quote ${viewQuote.quote_number || viewQuote.id.slice(0, 8)}`}</h2>
                  <p className="text-gray-500">
                    {getCustomerName(viewQuote.customer_id)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <QuoteExportButton 
                    quote={viewQuote} 
                    customer={getCustomer(viewQuote.customer_id)} 
                  />
                  <Button onClick={() => onEdit(viewQuote)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Quote Number</p>
                  <p className="font-medium">{viewQuote.quote_number || viewQuote.id.slice(0, 8)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Status</p>
                  <p>
                    <span className={`status-badge status-${viewQuote.status}`}>
                      {viewQuote.status.charAt(0).toUpperCase() + viewQuote.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="font-medium">{new Date(viewQuote.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-medium">{viewQuote.valid_until ? new Date(viewQuote.valid_until).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              {viewQuote.description && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{viewQuote.description}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewQuote.items && viewQuote.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex flex-col items-end space-y-1 pt-2">
                  <div className="flex justify-between w-48">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${viewQuote.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between w-48">
                    <span className="text-gray-600">Tax:</span>
                    <span>${viewQuote.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between w-48 font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>${viewQuote.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default QuoteTable;