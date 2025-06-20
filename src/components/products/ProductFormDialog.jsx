import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ValidatedInput, useFormValidation, validationRules } from "@/components/ui/form-validation";
import { Plus, Trash2 } from "lucide-react";

const ProductFormDialog = ({ onOpenChange, product, onSubmit, resetForm }) => {
  const initialTier = { upToQuantity: 10000, price: 0 };
  
  const initialValues = {
    name: product?.name || "",
    category: product?.category || "",
    description: product?.description || "",
    priceTiers: product?.priceTiers && product.priceTiers.length > 0 ? product.priceTiers : [initialTier]
  };

  const rules = {
    name: [validationRules.required],
    category: [validationRules.required]
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
    if (product) {
      Object.keys(initialValues).forEach(key => {
        setValue(key, initialValues[key]);
      });
    } else {
      reset();
    }
  }, [product]);

  const handleTierChange = (index, field, value) => {
    const updatedTiers = values.priceTiers.map((tier, i) => 
      i === index ? { 
        ...tier, 
        [field]: field === 'upToQuantity' ? Math.min(parseInt(value) || 0, 10000) : parseFloat(value) || 0 
      } : tier
    );
    setValue("priceTiers", updatedTiers);
  };

  const addPriceTier = () => {
    setValue("priceTiers", [...values.priceTiers, { upToQuantity: 10000, price: 0 }]);
  };

  const removePriceTier = (index) => {
    if (values.priceTiers.length > 1) {
      const updatedTiers = values.priceTiers.filter((_, i) => i !== index);
      setValue("priceTiers", updatedTiers);
    }
  };
  
  const handleSubmit = () => {
    // Validate price tiers
    const tierErrors = [];
    values.priceTiers.forEach((tier, index) => {
      if (!tier.upToQuantity || tier.upToQuantity <= 0) {
        tierErrors.push(`Tier ${index + 1}: Quantity must be greater than 0`);
      }
      if (!tier.price || tier.price < 0) {
        tierErrors.push(`Tier ${index + 1}: Price must be 0 or greater`);
      }
    });

    if (tierErrors.length > 0) {
      // You could show these errors in a toast or add them to the form validation
      return;
    }

    if (validateAll()) {
      onSubmit(values);
      if (resetForm) resetForm();
    }
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
        <ValidatedInput
          label="Product Name"
          required
          error={touched.name && errors.name}
          success={touched.name && !errors.name && values.name}
        >
          <Input
            value={values.name}
            onChange={(e) => setValue("name", e.target.value)}
            onBlur={() => setFieldTouched("name")}
            placeholder="Enter product name"
            className={touched.name && errors.name ? "border-red-500" : ""}
          />
        </ValidatedInput>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValidatedInput
            label="Category"
            required
            error={touched.category && errors.category}
            success={touched.category && !errors.category && values.category}
          >
            <Input
              value={values.category}
              onChange={(e) => setValue("category", e.target.value)}
              onBlur={() => setFieldTouched("category")}
              placeholder="e.g., Software, Service"
              className={touched.category && errors.category ? "border-red-500" : ""}
            />
          </ValidatedInput>
        </div>
        
        <ValidatedInput label="Description">
          <Textarea
            value={values.description}
            onChange={(e) => setValue("description", e.target.value)}
            placeholder="Enter product description"
            rows={3}
          />
        </ValidatedInput>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <Label>Pricing Tiers</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPriceTier}>
              <Plus className="h-4 w-4 mr-1" />Add Tier
            </Button>
          </div>
          <div className="space-y-2">
            {values.priceTiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Label className="text-xs">Up to Quantity (max 10000)</Label>
                  <Input
                    type="number"
                    value={tier.upToQuantity}
                    onChange={(e) => handleTierChange(index, "upToQuantity", e.target.value)}
                    placeholder="Max Quantity"
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="col-span-5">
                  <Label className="text-xs">Price per Unit</Label>
                  <Input
                    type="number"
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, "price", e.target.value)}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2 self-end">
                  {values.priceTiers.length > 1 && (
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
        <Button 
          onClick={handleSubmit}
          disabled={!isValid && Object.keys(touched).length > 0}
        >
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ProductFormDialog;