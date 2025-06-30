import React from "react";
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Download,
  Edit
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import QuoteExportButton from "./QuoteExportButton";

const QuoteViewDialog = ({ open, onOpenChange, quote, customer, onEdit }) => {
  if (!quote || !customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Quote {quote.quote_number || `#${quote.id.slice(0, 8)}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{quote.title || `Quote ${quote.quote_number || quote.id.slice(0, 8)}`}</h2>
              <p className="text-gray-500">
                {customer.company_name}
              </p>
            </div>
            <div className="flex space-x-2">
              <QuoteExportButton 
                quote={quote} 
                customer={customer} 
              />
              <Button onClick={() => onEdit(quote)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Quote Number</p>
              <p className="font-medium">{quote.quote_number || quote.id.slice(0, 8)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <p>
                <span className={`status-badge status-${quote.status}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{formatDate(quote.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-medium">{quote.valid_until ? formatDate(quote.valid_until) : 'N/A'}</p>
            </div>
          </div>
          
          {quote.description && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Description</p>
              <p>{quote.description}</p>
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
                  {quote.items && quote.items.map((item, index) => (
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
                <span>${quote.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between w-48">
                <span className="text-gray-600">Tax:</span>
                <span>${quote.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between w-48 font-bold border-t pt-1">
                <span>Total:</span>
                <span>${quote.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteViewDialog;