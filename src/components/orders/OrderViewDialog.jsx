import React from "react";
import { 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Truck, 
  Clock, 
  DollarSign,
  Download
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrderExportButton from "./OrderExportButton";

const OrderViewDialog = ({ open, onOpenChange, order, customer }) => {
  if (!order || !customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  const delivery = order.delivery && order.delivery.length > 0 ? order.delivery[0] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Order {order.quote_number || `#${order.id.slice(0, 8)}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{order.title || `Order for ${customer.company_name}`}</h3>
              <p className="text-gray-500">Created on {formatDate(order.created_at)}</p>
            </div>
            <OrderExportButton order={order} customer={customer} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Customer Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="font-medium">{customer.company_name}</p>
                <p>{customer.first_name} {customer.last_name}</p>
                <p>{customer.email}</p>
                {customer.phone && <p>{customer.phone}</p>}
              </div>
            </div>
            
            {/* Order Details */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-gray-500" />
                Order Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`status-badge status-${order.status}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`status-badge status-${order.payment_status}`}>
                    {formatStatus(order.payment_status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">${order.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                Shipping Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <p className="whitespace-pre-line">{order.shipping_address}</p>
                {order.tracking_number && (
                  <div className="mt-2">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium ml-2">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Delivery Information */}
            {delivery && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                  Delivery Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`status-badge status-${delivery.status}`}>
                      {formatStatus(delivery.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carrier:</span>
                    <span>{delivery.carrier?.toUpperCase() || 'N/A'}</span>
                  </div>
                  {delivery.estimated_delivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span>{formatDate(delivery.estimated_delivery)}</span>
                    </div>
                  )}
                  {delivery.actual_delivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered On:</span>
                      <span>{formatDate(delivery.actual_delivery)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Order Items */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Items</h4>
            {order.items && order.items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>{item.product_description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-right">${item.total_price?.toFixed(2) || (item.quantity * item.unit_price).toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No items found for this order.</p>
            )}
          </div>
          
          {/* Notes */}
          {delivery?.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Delivery Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{delivery.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderViewDialog;