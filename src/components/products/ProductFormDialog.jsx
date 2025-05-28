import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

const ProductFormDialog = ({ onOpenChange, product, onSubmit, resetForm }) => {
  const initialTier = { upToQuantity: 10000, price: 0 };
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    priceTiers: [initialTier]
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        priceTiers: product.priceTiers && product.priceTiers.length > 0 ? product.priceTiers : [initialTier]
      });
    } else {
      setFormData({ name: "", category: "", description: "", priceTiers: [initialTier] });
    }
  }, [product]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace("product-", "")]: value }));
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = formData.priceTiers.map((tier, i) => 
      i === index ? { ...tier, [field]: field === 'upToQuantity' ? Math.min(parseInt(value) || 0, 10000) : parseFloat(value) || 0 } : tier
    );
    setFormData(prev => ({ ...prev, priceTiers: updatedTiers }));
  };

  const addPriceTier = () => {
    setFormData(prev => ({
      ...prev,
      priceTiers: [...prev.priceTiers, { upToQuantity: 10000, price: 0 }]
    }));
  };

  const removePriceTier = (index) => {
    if (formData.priceTiers.length > 1) {
      const updatedTiers = formData.priceTiers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, priceTiers: updatedTiers }));
    }
  };
  
  const handleSubmit = () => {
    onSubmit(formData);
    if (resetForm) resetForm();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          {product ? "Update product details and pricing tiers." : "Add a new product and define its pricing tiers."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Software, Service"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea
            id="product-description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <Label>Pricing Tiers</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPriceTier}><Plus className="h-4 w-4 mr-1" />Add Tier</Button>
          </div>
          <div className="space-y-2">
          {formData.priceTiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Label htmlFor={`tier-qty-${index}`} className="text-xs">Up to Quantity (max 10000)</Label>
                <Input
                  id={`tier-qty-${index}`}
                  type="number"
                  value={tier.upToQuantity}
                  onChange={(e) => handleTierChange(index, "upToQuantity", e.target.value)}
                  placeholder="Max Quantity"
                  min="1"
                  max="10000"
                />
              </div>
              <div className="col-span-5">
                <Label htmlFor={`tier-price-${index}`} className="text-xs">Price per Unit</Label>
                <Input
                  id={`tier-price-${index}`}
                  type="number"
                  value={tier.price}
                  onChange={(e) => handleTierChange(index, "price", e.target.value)}
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 self-end">
                {formData.priceTiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePriceTier(index)}
                    className="mt-1"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => {
            onOpenChange(false);
            if(resetForm) resetForm();
        }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ProductFormDialog;