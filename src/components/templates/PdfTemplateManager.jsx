import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  Save, 
  Copy, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  Code,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import PdfTemplateEditor from "./PdfTemplateEditor";

const defaultTemplates = {
  quote: {
    name: "Quote PDF Template",
    language: "english",
    header: {
      title: "QUOTE",
      companyInfo: "Promocups\nYour Sales Management Solution",
      showLogo: true
    },
    content: {
      customerTitle: "Bill To:",
      quoteTitle: "Quote Title:",
      descriptionTitle: "Description:",
      itemsTitle: "Items",
      itemsColumns: ["Description", "Qty", "Price", "Total"],
      subtotalLabel: "Subtotal:",
      taxLabel: "Tax:",
      totalLabel: "Total:",
      termsTitle: "Terms and Conditions:",
      terms: [
        "1. This quote is valid for the period specified above.",
        "2. Payment terms: 50% upfront, 50% upon delivery.",
        "3. Prices are subject to change without notice.",
        "4. All work will be completed according to specifications."
      ],
      footerText: "Thank you for your business!"
    },
    colors: {
      primary: "#4f46e5",
      secondary: "#f9fafb",
      text: "#333333",
      headerText: "#ffffff"
    },
    fonts: {
      main: "Arial",
      size: "normal"
    }
  },
  order: {
    name: "Order PDF Template",
    language: "english",
    header: {
      title: "ORDER",
      companyInfo: "Promocups\nYour Sales Management Solution",
      showLogo: true
    },
    content: {
      customerTitle: "Bill To:",
      shippingTitle: "Shipping Address:",
      orderTitle: "Order Information:",
      statusTitle: "Order Status:",
      paymentTitle: "Payment Status:",
      trackingTitle: "Tracking Information:",
      deliveryTitle: "Delivery Information:",
      itemsTitle: "Items",
      itemsColumns: ["Description", "Qty", "Price", "Total"],
      subtotalLabel: "Subtotal:",
      taxLabel: "Tax:",
      totalLabel: "Total:",
      footerText: "Thank you for your business!"
    },
    colors: {
      primary: "#EF4B24",
      secondary: "#fff7ed",
      text: "#333333",
      headerText: "#ffffff"
    },
    fonts: {
      main: "Arial",
      size: "normal"
    }
  }
};

const PdfTemplateManager = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Try to load templates from localStorage
      const savedTemplates = localStorage.getItem('pdf_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        // Use default templates if none found
        setTemplates(defaultTemplates);
        // Save default templates to localStorage
        localStorage.setItem('pdf_templates', JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load PDF templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      setLoading(true);
      
      // Update local state
      setTemplates(prev => ({
        ...prev,
        [templateData.type]: {
          name: templateData.name,
          language: templateData.language,
          header: templateData.header,
          content: templateData.content,
          colors: templateData.colors,
          fonts: templateData.fonts
        }
      }));
      
      // Save to localStorage
      localStorage.setItem('pdf_templates', JSON.stringify({
        ...templates,
        [templateData.type]: {
          name: templateData.name,
          language: templateData.language,
          header: templateData.header,
          content: templateData.content,
          colors: templateData.colors,
          fonts: templateData.fonts
        }
      }));
      
      toast({
        title: "Template Saved",
        description: "PDF template has been saved successfully."
      });
      
      setIsEditorOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save PDF template.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (type) => {
    setEditingTemplate({
      type,
      ...templates[type]
    });
    setIsEditorOpen(true);
  };

  const handlePreviewTemplate = (type) => {
    setSelectedTemplate(type);
    setIsPreviewOpen(true);
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'quote':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'order':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const exportTemplate = (type) => {
    const template = templates[type];
    const exportData = {
      name: template.name,
      language: template.language,
      header: template.header,
      content: template.content,
      colors: template.colors,
      fonts: template.fonts,
      type: type,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-pdf-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Exported",
      description: "Template has been downloaded as JSON file."
    });
  };

  const importTemplate = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.header || !importedData.content || !importedData.colors || !importedData.fonts) {
          throw new Error('Invalid template file format');
        }
        
        setTemplates(prev => ({
          ...prev,
          [type]: {
            name: importedData.name || prev[type].name,
            language: importedData.language || prev[type].language,
            header: importedData.header,
            content: importedData.content,
            colors: importedData.colors,
            fonts: importedData.fonts
          }
        }));
        
        // Save to localStorage
        localStorage.setItem('pdf_templates', JSON.stringify({
          ...templates,
          [type]: {
            name: importedData.name || templates[type].name,
            language: importedData.language || templates[type].language,
            header: importedData.header,
            content: importedData.content,
            colors: importedData.colors,
            fonts: importedData.fonts
          }
        }));
        
        toast({
          title: "Template Imported",
          description: "Template has been successfully imported."
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error.message || "Failed to import template. Invalid file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 text-blue-500 mr-3" />
              PDF Template Management
            </CardTitle>
            <CardDescription>
              Customize PDF templates for quotes and orders.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(templates).map(([type, template]) => (
          <motion.div key={type} variants={itemVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {getTemplateIcon(type)}
                  <span className="ml-3">{template.name}</span>
                </CardTitle>
                <CardDescription>
                  Language: {template.language.charAt(0).toUpperCase() + template.language.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(type)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(type)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportTemplate(type)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      id={`import-${type}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".json"
                      onChange={(e) => importTemplate(e, type)}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit PDF Template</DialogTitle>
            <DialogDescription>
              Customize your PDF template layout, colors, and content.
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <PdfTemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setIsEditorOpen(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>PDF Template Preview</DialogTitle>
            <DialogDescription>
              This is a preview of how your PDF template will look.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="border rounded-lg overflow-hidden bg-gray-100 p-4">
              <div className="bg-white shadow-md mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                {/* Header */}
                <div 
                  className="p-6 text-white" 
                  style={{ backgroundColor: templates[selectedTemplate].colors.primary }}
                >
                  <h1 className="text-2xl font-bold">{templates[selectedTemplate].header.title}</h1>
                  <div className="whitespace-pre-line mt-2">{templates[selectedTemplate].header.companyInfo}</div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">{templates[selectedTemplate].content.customerTitle}</h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p>Demo Company</p>
                        <p>John Smith</p>
                        <p>john@example.com</p>
                      </div>
                    </div>
                    
                    <div>
                      {selectedTemplate === 'quote' ? (
                        <>
                          <p><strong>Quote #:</strong> QT-2025-000123</p>
                          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                          <p><strong>Valid Until:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Order #:</strong> ORD-2025-000456</p>
                          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                          <p><strong>Status:</strong> Processing</p>
                          <p><strong>Payment Status:</strong> Half Paid</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedTemplate === 'order' && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">{templates[selectedTemplate].content.shippingTitle}</h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p>123 Business Ave, Suite 100</p>
                        <p>New York, NY 10001</p>
                        <p>United States</p>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="font-semibold mb-2">{templates[selectedTemplate].content.itemsTitle}</h3>
                  <table className="w-full border-collapse mb-6">
                    <thead>
                      <tr className="bg-gray-50">
                        {templates[selectedTemplate].content.itemsColumns.map((col, index) => (
                          <th key={index} className="border p-2 text-left">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Product A</td>
                        <td className="border p-2">2</td>
                        <td className="border p-2">$500.00</td>
                        <td className="border p-2">$1,000.00</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Service B</td>
                        <td className="border p-2">1</td>
                        <td className="border p-2">$750.00</td>
                        <td className="border p-2">$750.00</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end mb-6">
                    <div className="w-64">
                      <div className="flex justify-between py-1">
                        <span>{templates[selectedTemplate].content.subtotalLabel}</span>
                        <span>$1,750.00</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{templates[selectedTemplate].content.taxLabel}</span>
                        <span>$140.00</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold border-t mt-1 pt-1">
                        <span>{templates[selectedTemplate].content.totalLabel}</span>
                        <span>$1,890.00</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTemplate === 'quote' && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">{templates[selectedTemplate].content.termsTitle}</h3>
                      <ul className="list-none pl-0 text-sm text-gray-600">
                        {templates[selectedTemplate].content.terms.map((term, index) => (
                          <li key={index} className="mb-1">{term}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-center mt-8 text-gray-500 text-sm">
                    {templates[selectedTemplate].content.footerText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfTemplateManager;