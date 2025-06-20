import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, Calendar, Edit, Send, CheckCircle, XCircle, Trash2, 
  MoreVertical, Bell, ShoppingCart, Loader2, Plus
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

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name} - ${customer.company_name}` : "Unknown";
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
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
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      {quote.quote_number || quote.id.slice(0, 8)}
                    </div>
                  </TableCell>
                  <TableCell>{getCustomerName(quote.customer_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>${quote.total?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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
                      <Button variant="ghost" size="icon" onClick={() => onEdit(quote)} title="Edit Quote">
                        <Edit className="h-4 w-4 text-amber-500" />
                      </Button>
                      
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteTable;