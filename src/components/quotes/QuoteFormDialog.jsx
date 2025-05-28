import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { getProducts, getProductPriceForQuantity } from "@/lib/productData";

const QuoteFormDialog = ({ onOpenChange, customers, onSubmit, quoteToEdit }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [newQuote, setNewQuote] = useState({
    customerId: "", title: "", description: "",
    items: [{ productId: "", description: "", quantity: 1, price: 0, manualPrice: false }],
    subtotal: 0, tax: 0, total: 0, validUntil: ""
  });

  useEffect(() => {
    setAllProducts(getProducts());
  }, []);

  useEffect(() => {
    if (quoteToEdit) {
      const items = quoteToEdit.items?.map(item => ({
        productId: item.productId || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        price: item.price || 0,
        manualPrice: item.manualPrice || false,
      })) || [{ productId: "", description: "", quantity: 1, price: 0, manualPrice: false }];
      setNewQuote({ ...quoteToEdit, items });
    } else {
      resetNewQuote();
    }
  }, [quoteToEdit]);

  const resetNewQuote = () => {
    setNewQuote({
      customerId: "", title: "", description: "",
      items: [{ productId: "", description: "", quantity: 1, price: 0, manualPrice: false }],
      subtotal: 0, tax: 0, total: 0, validUntil: ""
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newQuote.items];
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
    
    setNewQuote(prev => ({ ...prev, items: updatedItems }));
  };
  
  const handleAddItem = () => setNewQuote(prev => ({ ...prev, items: [...prev.items, { productId: "", description: "", quantity: 1, price: 0, manualPrice: false }]}));
  const handleRemoveItem = (index) => {
    const updatedItems = newQuote.items.filter((_, i) => i !== index);
    setNewQuote(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  useEffect(() => {
    const { subtotal, tax, total } = calculateTotals(newQuote.items);
    setNewQuote(prev => ({ ...prev, subtotal, tax, total }));
  }, [newQuote.items]);

  const handleSubmit = () => {
    onSubmit(newQuote);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{quoteToEdit ? "Edit Quote" : "Create New Quote"}</DialogTitle>
        <DialogDescription>Fill in the details for the quote.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={newQuote.customerId} onValueChange={(value) => setNewQuote({...newQuote, customerId: value})}>
              <SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" type="date" value={newQuote.validUntil} onChange={(e) => setNewQuote({...newQuote, validUntil: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Quote Title</Label>
          <Input id="title" value={newQuote.title} onChange={(e) => setNewQuote({...newQuote, title: e.target.value})} placeholder="Enter quote title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={newQuote.description} onChange={(e) => setNewQuote({...newQuote, description: e.target.value})} placeholder="Enter quote description" />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
          </div>
          {newQuote.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-2">
              <div className="col-span-4 space-y-1">
                <Label htmlFor={`item-product-${index}`} className="text-xs">Product</Label>
                <Select value={item.productId} onValueChange={(value) => handleItemChange(index, "productId", value)}>
                  <SelectTrigger id={`item-product-${index}`}><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{allProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-4 space-y-1">
                <Label htmlFor={`item-desc-${index}`} className="text-xs">Description</Label>
                <Input id={`item-desc-${index}`} value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} placeholder="Item description" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`item-qty-${index}`} className="text-xs">Quantity</Label>
                <Input id={`item-qty-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} placeholder="Qty" min="1" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor={`item-price-${index}`} className="text-xs">Price</Label>
                <Input id={`item-price-${index}`} type="number" value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} placeholder="Price" min="0" step="0.01" disabled={!item.manualPrice && item.quantity <= 10000} />
              </div>
              <div className="col-span-11 text-right text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</div>
              <div className="col-span-1 flex justify-end">
                {newQuote.items.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
              </div>
               {item.manualPrice && item.quantity > 10000 && (
                  <div className="col-span-12 text-xs text-amber-600">Manual price entry enabled for quantity over 10,000.</div>
                )}
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>${newQuote.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax (8%):</span><span>${newQuote.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>Total:</span><span>${newQuote.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSubmit}>{quoteToEdit ? "Save Changes" : "Create Quote"}</Button>
      </DialogFooter>
    </>
  );
};

export default QuoteFormDialog;