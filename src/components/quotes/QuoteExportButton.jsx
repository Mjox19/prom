import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateQuotePDF } from '@/lib/pdfUtils';
import { useToast } from '@/components/ui/use-toast';

const QuoteExportButton = ({ quote, customer, variant = "default", size = "default" }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      
      if (!quote || !customer) {
        throw new Error('Quote or customer information is missing');
      }
      
      toast({
        title: "Generating PDF",
        description: "Creating PDF document...",
      });
      
      // Generate PDF
      const pdfDoc = generateQuotePDF(quote, customer);
      
      // Save the PDF
      pdfDoc.save(`Quote-${quote.quote_number || quote.id.slice(0, 8)}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Quote PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting quote:', error);
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

export default QuoteExportButton;