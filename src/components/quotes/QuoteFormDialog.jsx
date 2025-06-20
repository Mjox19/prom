import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import { Plus, Trash2 } from "lucide-react";
import { getProducts, getProductPriceForQuantity } from "@/lib/productData";

const QuoteFormDialog = ({ onOpenChange, customers, onSubmit, quoteToEdit }) => {
  const [allProducts, setAllProducts] = useState([]);
  
  const initialValues = {
    customerId: quoteToEdit?.customer_id || "",
    description: quoteToEdit?.description || "",
    items: quoteToEdit?.items?.map(item => ({
      productId: item.productId || "",
      description: item.description || "",
      quantity: item.quantity || 1,
      price: item.price || 0,
      manualPrice: item.manualPrice || false,
    })) || [{ productId: "", description: "", quantity: 1, price: 0, manualPrice: false }],
    subtotal: quoteToEdit?.subtotal || 0,
    tax: quoteToEdit?.tax || 0,
    total: quoteToEdit?.total || 0,
    validUntil: quoteToEdit?.valid_until ? quoteToEdit.valid_until.split('T')[0] : (() => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      return date.toISOString().split('T')[0];
    })(),
    expectedDeliveryDate: quoteToEdit?.expected_delivery_date ? quoteToEdit.expected_delivery_date.split('T')[0] : (() => {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      return date.toISOString().split('T')[0];
    })()
  };

  const rules = {
    customerId: [validationRules.required],
    validUntil: [validationRules.required],
    expectedDeliveryDate: [validationRules.required]
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched: setFieldTouched,
    validateAll,
    reset,
    isValid
  } = useFormValidation(initialValues, rules);

  useEffect(() => {
    setAllProducts(getProducts());
  }, []);

  useEffect(() => {
    if (quoteToEdit) {
      Object.keys(initialValues).forEach(key => {
        setValue(key, initialValues[key]);
      });
    } else {
      reset();
    }
  }, [quoteToEdit]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...values.items];
    const currentItem = updatedItems[index];
    
    if (field === "productId") {
      const product = allProducts.find(p => p.id === value);
      currentItem.productId = value;
      currentItem.description = product ? product.name : "";
      if (!currentItem.manualPrice && product) {
        currentItem.price = getProductPriceForQuantity(product, currentItem.quantity);
      }
    } else if (field === "quantity") {
      const newQuantity = parseInt(value) || 0;
      currentItem.quantity = newQuantity;
      const product = allProducts.find(p => p.id === currentItem.productId);
      if (newQuantity > 10000) {
        currentItem.manualPrice = true;
      } else {
        currentItem.manualPrice = false;
        if (product) {
          currentItem.price = getProductPriceForQuantity(product, newQuantity);
        }
      }
    } else if (field === "price") {
      currentItem.price = parseFloat(value) || 0;
    } else {
      currentItem[field] = value;
    }
    
    setValue("items", updatedItems);
  };
  
  const handleAddItem = () => {
    setValue("items", [...values.items, { productId: "", description: "", quantity: 1, price: 0, manualPrice: false }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = values.items.filter((_, i) => i !== index);
    setValue("items", updatedItems);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  useEffect(() => {
    const { subtotal, tax, total } = calculateTotals(values.items);
    setValue("subtotal", subtotal);
    setValue("tax", tax);
    setValue("total", total);
  }, [values.items]);

  const handleSubmit = () => {
    // Create a quote object with a default title
    const quoteData = {
      ...values,
      title: `Quote for ${customers.find(c => c.id === values.customerId)?.company_name || 'Customer'}`
    };
    
    if (validateAll()) {
      onSubmit(quoteData);
    }
  };

  // Check if form is valid for submission
  const isFormValid = values.customerId && values.validUntil && values.expectedDeliveryDate && values.items.length > 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{quoteToEdit ? "Edit Quote" : "Create New Quote"}</DialogTitle>
        <DialogDescription>Fill in the details for the quote.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
        {quoteToEdit && (
          <ValidatedInput label="Quote Number">
            <Input
              value={quoteToEdit.quote_number || ""}
              disabled
              className="bg-gray-50 font-medium text-gray-700"
            />
          </ValidatedInput>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Customer"
            required
            error={touched.customerId && errors.customerId}
            success={touched.customerId && !errors.customerId && values.customerId}
          >
            <Select 
              value={values.customerId} 
              onValueChange={(value) => {
                setValue("customerId", value);
                setFieldTouched("customerId");
              }}
            >
              <SelectTrigger className={touched.customerId && errors.customerId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {`${c.first_name} ${c.last_name} - ${c.company_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ValidatedInput>
          
          <ValidatedInput
            label="Valid Until"
            required
            error={touched.validUntil && errors.validUntil}
            success={touched.validUntil && !errors.validUntil && values.validUntil}
          >
            <DatePicker
              value={values.validUntil}
              onChange={(value) => {
                setValue("validUntil", value);
                setFieldTouched("validUntil");
              }}
              placeholder="Select valid until date"
              className={touched.validUntil && errors.validUntil ? "border-red-500" : ""}
            />
          </ValidatedInput>
        </div>

        <ValidatedInput label="Special Client Notes">
          <Textarea
            value={values.description}
            onChange={(e) => setValue("description", e.target.value)}
            placeholder="Enter any special notes for this client"
            rows={3}
          />
        </ValidatedInput>

        <ValidatedInput
          label="Expected Delivery Date"
          required
          error={touched.expectedDeliveryDate && errors.expectedDeliveryDate}
          success={touched.expectedDeliveryDate && !errors.expectedDeliveryDate && values.expectedDeliveryDate}
        >
          <DatePicker
            value={values.expectedDeliveryDate}
            onChange={(value) => {
              setValue("expectedDeliveryDate", value);
              setFieldTouched("expectedDeliveryDate");
            }}
            placeholder="Select expected delivery date"
            className={touched.expectedDeliveryDate && errors.expectedDeliveryDate ? "border-red-500" : ""}
          />
        </ValidatedInput>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />Add Item
            </Button>
          </div>
          {values.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Product</Label>
                <Select value={item.productId} onValueChange={(value) => handleItemChange(index, "productId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4 space-y-1">
                <Label className="text-xs">Description</Label>
                <Input 
                  value={item.description} 
                  onChange={(e) => handleItemChange(index, "description", e.target.value)} 
                  placeholder="Item description" 
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input 
                  type="number" 
                  value={item.quantity} 
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)} 
                  placeholder="Qty" 
                  min="1" 
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Price</Label>
                <Input 
                  type="number" 
                  value={item.price} 
                  onChange={(e) => handleItemChange(index, "price", e.target.value)} 
                  placeholder="Price" 
                  min="0" 
                  step="0.01" 
                  disabled={!item.manualPrice && item.quantity <= 10000} 
                />
              </div>
              <div className="col-span-11 text-right text-sm font-medium">
                ${(item.quantity * item.price).toFixed(2)}
              </div>
              <div className="col-span-1 flex justify-end">
                {values.items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {item.manualPrice && item.quantity > 10000 && (
                <div className="col-span-12 text-xs text-amber-600">
                  Manual price entry enabled for quantity over 10,000.
                </div>
              )}
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${values.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%):</span>
              <span>${values.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${values.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          {quoteToEdit ? "Save Changes" : "Create Quote"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default QuoteFormDialog;