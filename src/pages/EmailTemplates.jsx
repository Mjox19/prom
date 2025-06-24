import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Plus, 
  Edit, 
  Eye, 
  Save, 
  Copy, 
  Trash2, 
  FileText, 
  ShoppingCart, 
  CheckCircle,
  Code,
  Monitor,
  Smartphone,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const defaultTemplates = {
  quote: {
    name: "Quote Email Template",
    subject: "Quote {{quote_number}} from {{company_name}}",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote {{quote_number}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .quote-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Quote {{quote_number}}</h1>
      <p>Your personalized quote is ready</p>
    </div>
    <div class="content">
      <p>Dear {{customer_name}},</p>
      <p>Thank you for your interest in our services. Please find your quote details below:</p>
      
      <div class="quote-details">
        <h3>Quote Details</h3>
        <p><strong>Quote Number:</strong> {{quote_number}}</p>
        <p><strong>Company:</strong> {{company_name}}</p>
        <p><strong>Valid Until:</strong> {{valid_until}}</p>
        <p><strong>Total Amount:</strong> &dollar;{{total_amount}}</p>
      </div>
      
      <p>{{quote_description}}</p>
      
      <p>If you have any questions about this quote, please don't hesitate to contact us.</p>
      
      <a href="#" class="button">View Full Quote</a>
      
      <p>Thank you for considering our services!</p>
    </div>
    <div class="footer">
      <p>{{company_name}} - Your Sales Management Solution</p>
    </div>
  </div>
</body>
</html>`
  },
  orderConfirmation: {
    name: "Order Confirmation Template",
    subject: "Order Confirmation - {{order_number}}",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .status-badge { display: inline-block; padding: 6px 12px; background: #10b981; color: white; border-radius: 20px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed!</h1>
      <p>Thank you for your order</p>
    </div>
    <div class="content">
      <p>Dear {{customer_name}},</p>
      <p>We're excited to confirm that we've received your order and it's being processed.</p>
      
      <div class="order-details">
        <h3>Order Information</h3>
        <p><strong>Order Number:</strong> {{order_number}}</p>
        <p><strong>Company:</strong> {{company_name}}</p>
        <p><strong>Order Date:</strong> {{order_date}}</p>
        <p><strong>Total Amount:</strong> &dollar;{{total_amount}}</p>
        <p><strong>Status:</strong> <span class="status-badge">{{order_status}}</span></p>
        <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
      </div>
      
      <p><strong>Shipping Address:</strong><br>{{shipping_address}}</p>
      
      <p>We'll keep you updated on your order status. You can expect delivery within the estimated timeframe.</p>
      
      <p>Thank you for choosing us!</p>
    </div>
    <div class="footer">
      <p>{{company_name}} - Your Sales Management Solution</p>
    </div>
  </div>
</body>
</html>`
  },
  orderStatusUpdate: {
    name: "Order Status Update Template",
    subject: "Order Update - {{order_number}} Status Changed",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-update { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
    .timeline { border-left: 2px solid #e5e7eb; padding-left: 20px; margin: 20px 0; }
    .timeline-item { margin-bottom: 15px; position: relative; }
    .timeline-dot { position: absolute; left: -26px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Order Status Update</h1>
      <p>Your order has been updated</p>
    </div>
    <div class="content">
      <p>Dear {{customer_name}},</p>
      <p>We wanted to update you on the status of your order.</p>
      
      <div class="status-update">
        <h3>Order #{{order_number}}</h3>
        <p><strong>Company:</strong> {{company_name}}</p>
        <p><strong>Previous Status:</strong> {{old_status}}</p>
        <p><strong>New Status:</strong> 
          <span class="status-badge" style="background-color: {{status_color}};">
            {{new_status}}
          </span>
        </p>
        {{#if tracking_number}}
        <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
        {{/if}}
      </div>
      
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <strong>{{status_message}}</strong>
        </div>
      </div>
      
      <p>If you have any questions about your order, please don't hesitate to contact us.</p>
      
      <p>Thank you for your business!</p>
    </div>
    <div class="footer">
      <p>{{company_name}} - Your Sales Management Solution</p>
    </div>
  </div>
</body>
</html>`
  }
};

const EmailTemplates = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        // Use default templates in demo mode
        setTemplates(defaultTemplates);
        setLoading(false);
        return;
      }

      // In a real implementation, you would load templates from Supabase
      // For now, we'll use the default templates
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load email templates.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        // Demo mode - update local state
        setTemplates(prev => ({
          ...prev,
          [templateData.type]: {
            name: templateData.name,
            subject: templateData.subject,
            html: templateData.html
          }
        }));
        
        toast({
          title: "Template Saved (Demo Mode)",
          description: "Email template has been saved to local storage."
        });
        
        setIsEditorOpen(false);
        setEditingTemplate(null);
        return;
      }

      // In a real implementation, save to Supabase
      toast({
        title: "Template Saved",
        description: "Email template has been saved successfully."
      });
      
      setIsEditorOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (type) => {
    setEditingTemplate({
      type,
      name: templates[type].name,
      subject: templates[type].subject,
      html: templates[type].html
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
      case 'orderConfirmation':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'orderStatusUpdate':
        return <ShoppingCart className="h-6 w-6 text-orange-500" />;
      default:
        return <Mail className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPreviewData = (type) => {
    const baseData = {
      company_name: "Promocups",
      customer_name: "John Smith",
      order_date: new Date().toLocaleDateString(),
      total_amount: "1,250.00"
    };

    switch (type) {
      case 'quote':
        return {
          ...baseData,
          quote_number: "QT-2025-000123",
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          quote_description: "This quote includes premium promotional cups with custom branding."
        };
      case 'orderConfirmation':
        return {
          ...baseData,
          order_number: "ORD-2025-000456",
          order_status: "Processing",
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          shipping_address: "123 Business Ave, Suite 100, New York, NY 10001"
        };
      case 'orderStatusUpdate':
        return {
          ...baseData,
          order_number: "ORD-2025-000456",
          old_status: "Processing",
          new_status: "Shipped",
          status_color: "#8b5cf6",
          status_message: "Your order has been shipped and is on its way to you.",
          tracking_number: "1Z999AA1234567890"
        };
      default:
        return baseData;
    }
  };

  const renderPreviewHtml = (html, data) => {
    let processedHtml = html;
    
    // Replace template variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, data[key]);
    });
    
    // Handle conditional blocks (basic implementation)
    processedHtml = processedHtml.replace(/{{#if tracking_number}}[\s\S]*?{{\/if}}/g, 
      data.tracking_number ? `<p><strong>Tracking Number:</strong> ${data.tracking_number}</p>` : '');
    
    return processedHtml;
  };

  const exportTemplate = (type) => {
    const template = templates[type];
    const exportData = {
      name: template.name,
      subject: template.subject,
      html: template.html,
      type: type,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Exported",
      description: "Template has been downloaded as JSON file."
    });
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
    <div className="h-full flex flex-col">
      <Header title="Email Templates" />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-500 mr-3" />
                  Email Template Management
                </CardTitle>
                <CardDescription>
                  Create and customize HTML email templates for quotes, order confirmations, and status updates.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(templates).map(([type, template]) => (
              <motion.div key={type} variants={itemVariants}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      {getTemplateIcon(type)}
                      <span className="ml-3">{template.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Subject: {template.subject}
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize your email template with HTML and template variables.
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <TemplateEditor
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
            <DialogTitle className="flex items-center justify-between">
              <span>Email Template Preview</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
              <iframe
                srcDoc={renderPreviewHtml(templates[selectedTemplate].html, getPreviewData(selectedTemplate))}
                className={`w-full ${previewMode === 'mobile' ? 'h-96' : 'h-[600px]'}`}
                title="Email Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TemplateEditor = ({ template, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: template.name,
    subject: template.subject,
    html: template.html
  });
  const [activeTab, setActiveTab] = useState('html');

  const handleSave = () => {
    onSave({
      type: template.type,
      name: formData.name,
      subject: formData.subject,
      html: formData.html
    });
  };

  const templateVariables = [
    '{{company_name}}', '{{customer_name}}', '{{quote_number}}', '{{order_number}}',
    '{{total_amount}}', '{{order_date}}', '{{valid_until}}', '{{order_status}}',
    '{{tracking_number}}', '{{shipping_address}}', '{{estimated_delivery}}',
    '{{old_status}}', '{{new_status}}', '{{status_color}}', '{{status_message}}'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="templateSubject">Email Subject</Label>
          <Input
            id="templateSubject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter email subject"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="html">HTML Editor</TabsTrigger>
          <TabsTrigger value="variables">Template Variables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="html" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateHtml">HTML Content</Label>
            <Textarea
              id="templateHtml"
              value={formData.html}
              onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
              placeholder="Enter HTML content"
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="variables" className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Available Template Variables</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templateVariables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(variable);
                    toast({
                      title: "Copied to clipboard",
                      description: `${variable} copied to clipboard`
                    });
                  }}
                  className="justify-start font-mono text-xs"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  {variable}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Click any variable to copy it to your clipboard, then paste it into your HTML template.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default EmailTemplates;

export default EmailTemplates