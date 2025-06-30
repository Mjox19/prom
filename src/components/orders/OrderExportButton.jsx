import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateOrderPDF } from '@/lib/pdfUtils';
import { useToast } from '@/components/ui/use-toast';

const OrderExportButton = ({ order, customer, variant = "default", size = "default" }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      
      if (!order || !customer) {
        throw new Error('Order or customer information is missing');
      }
      
      toast({
        title: "Generating PDF",
        description: "Creating PDF document...",
      });
      
      // Generate PDF
      const pdfDoc = generateOrderPDF(order, customer);
      
      // Save the PDF
      pdfDoc.save(`Order-${order.quote_number || order.id.slice(0, 8)}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Order PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting order:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Export PDF
    </Button>
  );
};

export default OrderExportButton;