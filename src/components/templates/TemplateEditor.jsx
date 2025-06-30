import React, { useState, useEffect } from "react";
import { Save, Copy, Eye, Code, Monitor, Smartphone, Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const TemplateEditor = ({ template, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: template.name,
    subject: template.subject,
    html: template.html,
    language: 'english'
  });
  const [activeTab, setActiveTab] = useState('html');
  const [previewMode, setPreviewMode] = useState('desktop');
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: template.name,
      subject: template.subject,
      html: template.html,
      language: 'english'
    });
  }, [template]);

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
    '{{old_status}}', '{{new_status}}', '{{status_color}}', '{{status_message}}',
    '{{carrier}}', '{{delivery_date}}', '{{order_amount}}'
  ];

  const getPreviewData = () => {
    const baseData = {
      company_name: "Promocups",
      customer_name: "John Smith",
      order_date: new Date().toLocaleDateString(),
      total_amount: "1,250.00",
      order_amount: "1,250.00",
      quote_number: "QT-2025-000123",
      order_number: "ORD-2025-000456",
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      order_status: "Processing",
      tracking_number: "1Z999AA1234567890",
      shipping_address: "123 Business Ave, Suite 100, New York, NY 10001",
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      old_status: "Pending",
      new_status: "Processing",
      status_color: "#3b82f6",
      status_message: "Your order is now being processed and will be shipped soon.",
      carrier: "FedEx",
      delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    return baseData;
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

  const exportTemplate = () => {
    const exportData = {
      name: formData.name,
      subject: formData.subject,
      html: formData.html,
      type: template.type,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.type}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Exported",
      description: "Template has been downloaded as JSON file."
    });
  };

  const importTemplate = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.html || !importedData.name || !importedData.subject) {
          throw new Error('Invalid template file format');
        }
        
        setFormData({
          ...formData,
          name: importedData.name,
          subject: importedData.subject,
          html: importedData.html
        });
        
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

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Template Language</Label>
          <div className="flex space-x-2">
            <Select 
              value={formData.language} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="dutch">Dutch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Language Selection</p>
              <p className="text-amber-700">
                This setting is for preview purposes only. The actual email language will be determined by the customer's language preference.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="html" className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            HTML Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center">
            <Copy className="h-4 w-4 mr-2" />
            Variables
          </TabsTrigger>
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
        
        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-end space-x-2 mb-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>
          <div className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
            <iframe
              srcDoc={renderPreviewHtml(formData.html, getPreviewData())}
              className={`w-full ${previewMode === 'mobile' ? 'h-[600px]' : 'h-[600px]'}`}
              title="Template Preview"
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

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Export Template
          </Button>
          <div className="relative">
            <input
              type="file"
              id="importTemplate"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".json"
              onChange={importTemplate}
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Template
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
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
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;