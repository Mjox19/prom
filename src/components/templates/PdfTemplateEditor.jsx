import React, { useState, useEffect } from "react";
import { Save, AlertTriangle, Check, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const PdfTemplateEditor = ({ template, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: template.name,
    language: template.language || 'english',
    header: template.header || {},
    content: template.content || {},
    colors: template.colors || {},
    fonts: template.fonts || {}
  });
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: template.name,
      language: template.language || 'english',
      header: template.header || {},
      content: template.content || {},
      colors: template.colors || {},
      fonts: template.fonts || {}
    });
  }, [template]);

  const handleSave = () => {
    onSave({
      type: template.type,
      name: formData.name,
      language: formData.language,
      header: formData.header,
      content: formData.content,
      colors: formData.colors,
      fonts: formData.fonts
    });
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, nestedSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    const newArray = [...formData[section][field]];
    newArray[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: newArray
      }
    }));
  };

  const addArrayItem = (section, field, defaultValue = "") => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] || []), defaultValue]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    const newArray = [...formData[section][field]];
    newArray.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: newArray
      }
    }));
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
          <Label htmlFor="templateLanguage">Template Language</Label>
          <Select 
            value={formData.language} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger>
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
              This setting determines the language used in the PDF. The actual language will be determined by the customer's language preference.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label>Template Type</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="font-medium capitalize">{template.type} Template</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This template will be used when generating {template.type} PDFs.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">
                This is a simplified preview of how your PDF will look. For a more detailed preview, use the Preview button.
              </p>
              <div className="bg-white border rounded-md p-4 shadow-sm">
                <div 
                  className="p-3 text-white rounded-t-md" 
                  style={{ backgroundColor: formData.colors.primary }}
                >
                  <h3 className="font-bold">{formData.header.title}</h3>
                </div>
                <div className="p-3">
                  <p><strong>{formData.content.customerTitle}</strong> Customer Name</p>
                  <p><strong>{template.type === 'quote' ? 'Quote #:' : 'Order #:'}</strong> {template.type === 'quote' ? 'QT-2025-000123' : 'ORD-2025-000456'}</p>
                  <p><strong>Total:</strong> $1,890.00</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="header" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headerTitle">Header Title</Label>
            <Input
              id="headerTitle"
              value={formData.header.title || ''}
              onChange={(e) => handleChange('header', 'title', e.target.value)}
              placeholder="Enter header title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyInfo">Company Information</Label>
            <Textarea
              id="companyInfo"
              value={formData.header.companyInfo || ''}
              onChange={(e) => handleChange('header', 'companyInfo', e.target.value)}
              placeholder="Enter company information"
              rows={3}
            />
            <p className="text-xs text-gray-500">Use line breaks for multiple lines</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showLogo"
              checked={formData.header.showLogo || false}
              onChange={(e) => handleChange('header', 'showLogo', e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <Label htmlFor="showLogo" className="text-sm">Show Company Logo</Label>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          {template.type === 'quote' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerTitle">Customer Section Title</Label>
                  <Input
                    id="customerTitle"
                    value={formData.content.customerTitle || ''}
                    onChange={(e) => handleChange('content', 'customerTitle', e.target.value)}
                    placeholder="e.g., Bill To:"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quoteTitle">Quote Title Label</Label>
                  <Input
                    id="quoteTitle"
                    value={formData.content.quoteTitle || ''}
                    onChange={(e) => handleChange('content', 'quoteTitle', e.target.value)}
                    placeholder="e.g., Quote Title:"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descriptionTitle">Description Label</Label>
                <Input
                  id="descriptionTitle"
                  value={formData.content.descriptionTitle || ''}
                  onChange={(e) => handleChange('content', 'descriptionTitle', e.target.value)}
                  placeholder="e.g., Description:"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="termsTitle">Terms & Conditions Title</Label>
                <Input
                  id="termsTitle"
                  value={formData.content.termsTitle || ''}
                  onChange={(e) => handleChange('content', 'termsTitle', e.target.value)}
                  placeholder="e.g., Terms and Conditions:"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <div className="space-y-2 border rounded-md p-3">
                  {(formData.content.terms || []).map((term, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={term}
                        onChange={(e) => handleArrayChange('content', 'terms', index, e.target.value)}
                        placeholder={`Term ${index + 1}`}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeArrayItem('content', 'terms', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addArrayItem('content', 'terms', `Term ${(formData.content.terms || []).length + 1}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Term
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerTitle">Customer Section Title</Label>
                  <Input
                    id="customerTitle"
                    value={formData.content.customerTitle || ''}
                    onChange={(e) => handleChange('content', 'customerTitle', e.target.value)}
                    placeholder="e.g., Bill To:"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shippingTitle">Shipping Section Title</Label>
                  <Input
                    id="shippingTitle"
                    value={formData.content.shippingTitle || ''}
                    onChange={(e) => handleChange('content', 'shippingTitle', e.target.value)}
                    placeholder="e.g., Shipping Address:"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderTitle">Order Information Title</Label>
                  <Input
                    id="orderTitle"
                    value={formData.content.orderTitle || ''}
                    onChange={(e) => handleChange('content', 'orderTitle', e.target.value)}
                    placeholder="e.g., Order Information:"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="statusTitle">Status Section Title</Label>
                  <Input
                    id="statusTitle"
                    value={formData.content.statusTitle || ''}
                    onChange={(e) => handleChange('content', 'statusTitle', e.target.value)}
                    placeholder="e.g., Order Status:"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTitle">Payment Section Title</Label>
                  <Input
                    id="paymentTitle"
                    value={formData.content.paymentTitle || ''}
                    onChange={(e) => handleChange('content', 'paymentTitle', e.target.value)}
                    placeholder="e.g., Payment Status:"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trackingTitle">Tracking Section Title</Label>
                  <Input
                    id="trackingTitle"
                    value={formData.content.trackingTitle || ''}
                    onChange={(e) => handleChange('content', 'trackingTitle', e.target.value)}
                    placeholder="e.g., Tracking Information:"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryTitle">Delivery Section Title</Label>
                <Input
                  id="deliveryTitle"
                  value={formData.content.deliveryTitle || ''}
                  onChange={(e) => handleChange('content', 'deliveryTitle', e.target.value)}
                  placeholder="e.g., Delivery Information:"
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="itemsTitle">Items Section Title</Label>
            <Input
              id="itemsTitle"
              value={formData.content.itemsTitle || ''}
              onChange={(e) => handleChange('content', 'itemsTitle', e.target.value)}
              placeholder="e.g., Items"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Items Table Columns</Label>
            <div className="space-y-2 border rounded-md p-3">
              {(formData.content.itemsColumns || []).map((column, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={column}
                    onChange={(e) => handleArrayChange('content', 'itemsColumns', index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeArrayItem('content', 'itemsColumns', index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={(formData.content.itemsColumns || []).length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addArrayItem('content', 'itemsColumns', `Column ${(formData.content.itemsColumns || []).length + 1}`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotalLabel">Subtotal Label</Label>
              <Input
                id="subtotalLabel"
                value={formData.content.subtotalLabel || ''}
                onChange={(e) => handleChange('content', 'subtotalLabel', e.target.value)}
                placeholder="e.g., Subtotal:"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxLabel">Tax Label</Label>
              <Input
                id="taxLabel"
                value={formData.content.taxLabel || ''}
                onChange={(e) => handleChange('content', 'taxLabel', e.target.value)}
                placeholder="e.g., Tax:"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalLabel">Total Label</Label>
              <Input
                id="totalLabel"
                value={formData.content.totalLabel || ''}
                onChange={(e) => handleChange('content', 'totalLabel', e.target.value)}
                placeholder="e.g., Total:"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              value={formData.content.footerText || ''}
              onChange={(e) => handleChange('content', 'footerText', e.target.value)}
              placeholder="e.g., Thank you for your business!"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="styling" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={formData.colors.primary || '#4f46e5'}
                  onChange={(e) => handleChange('colors', 'primary', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.colors.primary || '#4f46e5'}
                  onChange={(e) => handleChange('colors', 'primary', e.target.value)}
                  placeholder="e.g., #4f46e5"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryColor"
                  value={formData.colors.secondary || '#f9fafb'}
                  onChange={(e) => handleChange('colors', 'secondary', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.colors.secondary || '#f9fafb'}
                  onChange={(e) => handleChange('colors', 'secondary', e.target.value)}
                  placeholder="e.g., #f9fafb"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="textColor"
                  value={formData.colors.text || '#333333'}
                  onChange={(e) => handleChange('colors', 'text', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.colors.text || '#333333'}
                  onChange={(e) => handleChange('colors', 'text', e.target.value)}
                  placeholder="e.g., #333333"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headerTextColor">Header Text Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="headerTextColor"
                  value={formData.colors.headerText || '#ffffff'}
                  onChange={(e) => handleChange('colors', 'headerText', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.colors.headerText || '#ffffff'}
                  onChange={(e) => handleChange('colors', 'headerText', e.target.value)}
                  placeholder="e.g., #ffffff"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select 
                value={formData.fonts.main || 'Arial'} 
                onValueChange={(value) => handleChange('fonts', 'main', value)}
              >
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times">Times</SelectItem>
                  <SelectItem value="Courier">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select 
                value={formData.fonts.size || 'normal'} 
                onValueChange={(value) => handleChange('fonts', 'size', value)}
              >
                <SelectTrigger id="fontSize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md mt-4">
            <h3 className="font-medium mb-2">Style Preview</h3>
            <div 
              className="p-4 rounded-md mb-3" 
              style={{ 
                backgroundColor: formData.colors.primary,
                color: formData.colors.headerText,
                fontFamily: formData.fonts.main
              }}
            >
              <p className="font-bold">Header Style</p>
              <p>This is how your header will look</p>
            </div>
            
            <div 
              className="p-4 rounded-md" 
              style={{ 
                backgroundColor: formData.colors.secondary,
                color: formData.colors.text,
                fontFamily: formData.fonts.main
              }}
            >
              <p className="font-bold">Content Style</p>
              <p>This is how your content will look</p>
              <p>Font: {formData.fonts.main}</p>
              <p>Size: {formData.fonts.size}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
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
  );
};

export default PdfTemplateEditor;